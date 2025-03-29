#[starknet::contract]
mod StrkStakingContract {
    use starknet::storage::Map;
    use starknet::{ContractAddress, get_caller_address, get_contract_address};

    // Define the IERC20 interface to interact with the STRK token
    #[starknet::interface]
    trait IERC20<TContractState> {
        fn transfer_from(
            ref self: TContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool;
        fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
        fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    }

    #[storage]
    struct Storage {
        // Mapping from user address to their staked amount
        staked_balances: Map<ContractAddress, u256>,
        // STRK token contract address
        strk_token: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, strk_token_address: ContractAddress) {
        // Initialize with the STRK token address
        self.strk_token.write(strk_token_address);
    }

    // Function 1: Deposit STRK tokens
    #[external(v0)]
    fn deposit(ref self: ContractState, amount: u256) {
        // Get the caller's address
        let caller = get_caller_address();

        // Get this contract's address
        let contract_address = get_contract_address();

        // Get the STRK token contract address
        let strk_token_address = self.strk_token.read();

        // Call transfer_from on the STRK token to transfer tokens from user to this contract
        let success = IERC20Dispatcher { contract_address: strk_token_address }
            .transfer_from(caller, contract_address, amount);

        // Ensure the transfer was successful
        assert(success, 'STRK transfer failed');

        // Get the current staked amount for the caller
        let current_stake = self.staked_balances.read(caller);

        // Add the deposit amount to the caller's balance
        self.staked_balances.write(caller, current_stake + amount);
    }

    // Function 2: Withdraw STRK tokens
    #[external(v0)]
    fn withdraw(ref self: ContractState, amount: u256) {
        // Get the caller's address
        let caller = get_caller_address();

        // Get the current staked amount for the caller
        let current_stake = self.staked_balances.read(caller);

        // Make sure the caller has enough funds
        assert(current_stake >= amount, 'Insufficient balance');

        // Update the caller's balance by subtracting the withdrawn amount
        self.staked_balances.write(caller, current_stake - amount);

        // Get the STRK token contract address
        let strk_token_address = self.strk_token.read();

        // Transfer STRK tokens from this contract to the user
        let success = IERC20Dispatcher { contract_address: strk_token_address }
            .transfer(caller, amount);

        // Ensure the transfer was successful
        assert(success, 'STRK transfer failed');
    }
}
