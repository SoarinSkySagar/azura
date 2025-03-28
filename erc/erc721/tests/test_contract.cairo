use core::array::ArrayTrait;
use core::byte_array::ByteArray;
use core::result::ResultTrait;
use core::traits::Into;
// use openzeppelin::token::erc721::interface::{ERC721ABIDispatcher, ERC721ABIDispatcherTrait};
use erc::erc721::{IERC721Dispatcher as NFTDispatcher, IERC721DispatcherTrait as NFTDispatcherTrait};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
    stop_cheat_caller_address,
};
use starknet::{ContractAddress, contract_address_const};

// Account functions
fn owner() -> ContractAddress {
    contract_address_const::<'OWNER'>()
}

fn caller() -> ContractAddress {
    contract_address_const::<'CALLER'>()
}

const SUCCESS: felt252 = 'SUCCESS';

// Helper function to declare and deploy the receiver mock
fn setup_receiver() -> ContractAddress {
    let receiver_class = declare("DualCaseERC721ReceiverMock").unwrap().contract_class();
    let (contract_address, _) = receiver_class.deploy(@array![]).unwrap();
    contract_address
}

// Now recipient will be the deployed mock contract
fn recipient() -> ContractAddress {
    setup_receiver()
}

fn setup_dispatcher() -> (ContractAddress, NFTDispatcher) {
    let owner_address: ContractAddress = contract_address_const::<'OWNER'>();
    // Declare the contract
    let contract = declare("ERC721").unwrap().contract_class();

    // Prepare constructor calldata
    let mut calldata: Array<felt252> = ArrayTrait::new();

    // Add constructor arguments
    owner_address.serialize(ref calldata);

    let name: ByteArray = "TestNFT";
    let symbol: ByteArray = "TNFT";
    let base_uri: ByteArray = "hhtp://baseuri";

    name.serialize(ref calldata);
    symbol.serialize(ref calldata);
    base_uri.serialize(ref calldata);

    // Deploy contract
    let (address, _) = contract.deploy(@calldata).unwrap();

    // Create dispatcher
    (address, NFTDispatcher { contract_address: address })
}

#[test]
fn test_successful_mint() {
    let (contract_address, dispatcher) = setup_dispatcher();
    // let recipient = contract_address_const::<'RECIPIENT'>();
    let token_id: u256 = 1;

    // Option 1: Send empty data
    let empty_data: Span<felt252> = array![].span();

    // Option 2: Send SUCCESS data
    let success_data: Span<felt252> = array![SUCCESS].span();

    // deploy a mock (ERC721Received) contract at the recipient address
    let recipient = recipient();

    // Mint the token
    start_cheat_caller_address(contract_address, owner());
    dispatcher.safe_mint(recipient, token_id, success_data);
    stop_cheat_caller_address(contract_address);

    let erc721 = NFTDispatcher { contract_address };
    assert(erc721.owner_of(token_id) == recipient, 'Wrong owner');
    assert(erc721.balance_of(recipient) == 1, 'Wrong balance');
}

#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_mint_not_owner() {
    let (contract_address, dispatcher) = setup_dispatcher();
    let recipient = contract_address_const::<'RECIPIENT'>();
    let token_id: u256 = 1;
    let empty_data: Span<felt252> = array![].span();

    // Attempt to mint the token, expecting a panic
    start_cheat_caller_address(contract_address, caller());
    dispatcher.safe_mint(recipient, token_id, empty_data);
    stop_cheat_caller_address(contract_address);
}
