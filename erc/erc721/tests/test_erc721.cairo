
use core::num::traits::zero::Zero;
use core::starknet::SyscallResultTrait;
use core::traits::{TryInto; Into};
use starknet::ContractAddress;

use snforge_std::{
    declare, start_cheat_caller_address, stop_cheat_caller_address, ContractClassTrait,
    DeclareResultTrait
};

use openzeppelin::{token::erc721::interface::{ERC721ABIDispatcher, ERC721ABIDispatcherTrait}};
use openzeppelin_token::erc721::interface::{IERC721MetadataDispatcher,IERC721MetadataDispatcherTrait};

use erc::erc721::IERC721Dispatcher as NFTDispatcher;
use erc::erc721::IERC721DispatcherTrait as NFTDispatcherTrait;


fn __setup__() -> ContractAddress {
    let nft_contract = declare("ERC721").unwrap().contract_class();
    let mut calldata: Array<felt252> = array![ADMIN];
    let (nft_contract_address, _) = nft_contract.deploy(@calldata).unwrap_syscall();
    (nft_contract_address)
}

#[test]
fn test_mint_nft_by_owner() {
    let nft_contract_address = __setup__();
    let dispatcher = IERC721Impl { contract_address: nft_contract_address };
    start_cheat_caller_address(nft_contract_address, ADMIN.try_into().unwrap());

    // Mint NFT for USER_ONE
    dispatcher.mint(USER_ONE.try_into().unwrap());

    // Assert that USER_ONE now owns an NFT
    let erc721_dispatcher = ERC721ABIDispatcher { contract_address: nft_contract_address };
    let balance = erc721_dispatcher.balance_of(USER_ONE.try_into().unwrap());
    assert(balance == 1, 'NFT not minted or balance incorrect');

    stop_cheat_caller_address(nft_contract_address);
}

#[test]
#[should_panic(expected: 'Only the owner can mint NFTs')]
fn test_mint_nft_by_non_owner() {
    let nft_contract_address = __setup__();
    let dispatcher = IERC721Impl { contract_address: nft_contract_address };
    start_cheat_caller_address(nft_contract_address, USER_ONE.try_into().unwrap());

    // Attempt minting NFT by a non-owner, should panic
    dispatcher.mint(USER_ONE.try_into().unwrap());

    stop_cheat_caller_address(nft_contract_address);
}

#[test]
#[should_panic(expected: 'NFT with id already exists')]
fn test_mint_nft_with_existing_id() {
    let nft_contract_address = __setup__();
    let dispatcher = IERC721Impl { contract_address: nft_contract_address };
    start_cheat_caller_address(nft_contract_address, ADMIN.try_into().unwrap());

    // Mint first NFT for USER_ONE
    dispatcher.mint(USER_ONE.try_into().unwrap());

    // Attempt minting the same token ID, which should fail
    dispatcher.mint(USER_ONE.try_into().unwrap());

    stop_cheat_caller_address(nft_contract_address);
}

#[test]
fn test_upgrade_contract() {
    let nft_contract_address = __setup__();
    let dispatcher = IERC721Impl { contract_address: nft_contract_address };
    start_cheat_caller_address(nft_contract_address, ADMIN.try_into().unwrap());

    // Declare a new contract class (to simulate upgrade)
    let new_class_hash = declare("NewERC721Class").unwrap();
    
    // Upgrade the contract
    dispatcher.upgrade(new_class_hash.class_hash());

    stop_cheat_caller_address(nft_contract_address);
}