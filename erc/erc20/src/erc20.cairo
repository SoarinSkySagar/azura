use starknet::{ContractAddress};

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256,
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
}

#[starknet::contract]
mod erc20 {
    use core::num::traits::{Bounded, Zero};
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };

    #[storage]
    struct Storage {
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
        total_supply: u256,
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        value: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Approval: Approval,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        initial_supply: u256,
        mint_to: ContractAddress,
    ) {
        self.initializer(name, symbol, decimals);
        self.mint(mint_to, initial_supply);
    }

    #[abi(embed_v0)]
    impl IERC20 of super::IERC20<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }

        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.entry(account).read()
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress,
        ) -> u256 {
            self.allowances.entry((owner, spender)).read()
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            let sender = get_caller_address();
            self._transfer(sender, recipient, amount);
            true
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool {
            let caller = get_caller_address();
            self._spend_allowance(sender, caller, amount);
            self._transfer(sender, recipient, amount);
            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            let caller = get_caller_address();
            self._approve(caller, spender, amount);
            true
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn initializer(ref self: ContractState, name: ByteArray, symbol: ByteArray, decimals: u8) {
            self.name.write(name);
            self.symbol.write(symbol);
            self.decimals.write(decimals);
        }

        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            assert!(!recipient.is_zero(), "ERC20: mint to the zero address");
            self.update(Zero::zero(), recipient, amount);
        }

        fn burn(ref self: ContractState, account: ContractAddress, amount: u256) {
            self.update(account, Zero::zero(), amount);
        }

        fn update(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, amount: u256,
        ) {
            if (from == Zero::zero()) {
                let total_supply = self.total_supply.read();
                self.total_supply.write(total_supply + amount);
            } else {
                let from_balance = self.balances.entry(from).read();
                assert!(from_balance >= amount, "ERC20: transfer amount exceeds balance");
                self.balances.entry(from).write(from_balance - amount);
            }

            if (to == Zero::zero()) {
                let total_supply = self.total_supply.read();
                self.total_supply.write(total_supply - amount);
            } else {
                let to_balance = self.balances.entry(to).read();
                self.balances.entry(to).write(to_balance + amount);
            }

            self.emit(Transfer { from, to, value: amount });
        }

        fn _transfer(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) {
            assert!(!sender.is_zero(), "ERC20: transfer from the zero address");
            assert!(!recipient.is_zero(), "ERC20: transfer to the zero address");
            self.update(sender, recipient, amount);
        }

        fn _approve(
            ref self: ContractState, owner: ContractAddress, spender: ContractAddress, amount: u256,
        ) {
            assert!(!owner.is_zero(), "ERC20: approve from the zero address");
            assert!(!spender.is_zero(), "ERC20: approve to the zero address");
            self.allowances.entry((owner, spender)).write(amount);
            self.emit(Approval { owner, spender, value: amount });
        }

        fn _spend_allowance(
            ref self: ContractState, owner: ContractAddress, spender: ContractAddress, amount: u256,
        ) {
            let current_allowance = self.allowances.entry((owner, spender)).read();
            if current_allowance != Bounded::MAX {
                assert!(current_allowance >= amount, "ERC20: insufficient allowance");
                self._approve(owner, spender, current_allowance - amount);
            }
        }
    }
}
