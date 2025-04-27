
use erc::achievement_nft::{AchievementNFT, IAchievementNFTDispatcher, IAchievementNFTDispatcherTrait, IAchievementNFTSafeDispatcher, IAchievementNFTSafeDispatcherTrait};
use openzeppelin::access::ownable::interface::IOwnableDispatcher;
use starknet::ContractAddress;
use snforge_std::{ declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address };
use snforge_std::{ spy_events, EventSpyAssertionsTrait };
use core::array::ArrayTrait;
use core::byte_array::ByteArray;
use core::result::ResultTrait;

// Test account -> Owner
fn OWNER() -> ContractAddress {
    123.try_into().unwrap()
}

fn deploy_contract() -> (IAchievementNFTDispatcher, IOwnableDispatcher, IAchievementNFTSafeDispatcher) {
    let name: ByteArray = "MyNFT";
    let symbol: ByteArray = "NFT";
    let base_uri: ByteArray = "https://example.com/";

    let contract_class = declare("AchievementNFT").unwrap().contract_class();

    let mut constructor_args: Array<felt252> = array![];
    
    name.serialize(ref constructor_args);
    symbol.serialize(ref constructor_args);
    base_uri.serialize(ref constructor_args);
    OWNER().serialize(ref constructor_args);

    let (contract_address, _) = contract_class
        .deploy(@constructor_args)
        .unwrap();

    let acheivement_nft = IAchievementNFTDispatcher { contract_address };
    let ownable = IOwnableDispatcher { contract_address };
    let safe_dispatcher = IAchievementNFTSafeDispatcher { contract_address };

    (acheivement_nft, ownable, safe_dispatcher)
}

#[test]
fn test_award_nft() {
    let (acheivement_nft, _, _) = deploy_contract();
    let recipient: ContractAddress = 456.try_into().unwrap();
    let token_id: u256 = 1.into();

    // Setup cheat to set caller address to the owner
    start_cheat_caller_address(acheivement_nft.contract_address, OWNER());

    // Setup event spy
    let mut spy = spy_events();

    // First, set that the recipient has earned the achievement
    acheivement_nft.set_achievement(recipient, true);

    // Award the NFT
    acheivement_nft.award_nft(recipient, token_id);

    stop_cheat_caller_address(acheivement_nft.contract_address);

    // Check that the achievement was awarded
    assert(acheivement_nft.has_earned_achievement(recipient), 'Achievement not set');

    // Assert that an event was emitted
    let expected_event = AchievementNFT::Event::AchievementAwarded(
        AchievementNFT::AchievementAwarded { recipient, token_id }
    );
    spy.assert_emitted(@array![(acheivement_nft.contract_address, expected_event)]);
}

#[test]
#[should_panic(expected: 'Achievement not earned')]
fn test_panic_award_nft_achievement_not_earned() {
    let (acheivement_nft, _, _) = deploy_contract();
    let recipient: ContractAddress = 456.try_into().unwrap();
    let token_id: u256 = 1.into();

    // Setup cheat to set caller address to the owner
    start_cheat_caller_address(acheivement_nft.contract_address, OWNER());

    // Attempt to award the NFT without setting the achievement
    acheivement_nft.award_nft(recipient, token_id);

    stop_cheat_caller_address(acheivement_nft.contract_address);
}

#[test]
#[feature("safe_dispatcher")]
fn test_safe_panic_award_nft_achievement_not_earned() {
    let (acheivement_nft, _, safe_dispatcher) = deploy_contract();
    let recipient: ContractAddress = 456.try_into().unwrap();
    let token_id: u256 = 1.into();

    // Setup cheat to set caller address to the owner
    start_cheat_caller_address(acheivement_nft.contract_address, OWNER());

    // Attempt to award the NFT without setting the achievement

    match safe_dispatcher.award_nft(recipient, token_id) {
        Result::Ok(_) => panic!("Cannot award NFT"),
        Result::Err(e) => assert(*e[0] == 'Achievement not earned', *e.at(0)),
    }
}

#[test]
#[should_panic(expected: 'Caller is not the owner')]
fn test_panic_award_nft_not_owner() {
    let (acheivement_nft, _, _) = deploy_contract();
    let recipient: ContractAddress = 456.try_into().unwrap();
    let token_id: u256 = 1.into();
    let attacker: ContractAddress = 789.try_into().unwrap();

    // Setup cheat to set caller address to the attacker
    start_cheat_caller_address(acheivement_nft.contract_address, attacker);

    // Attempt to award the NFT without being the owner
    acheivement_nft.award_nft(recipient, token_id);

    stop_cheat_caller_address(acheivement_nft.contract_address);
}

#[test]
#[feature("safe_dispatcher")]
fn test_safe_panic_award_nft_not_owner() {
    let (acheivement_nft, _, safe_dispatcher) = deploy_contract();
    let recipient: ContractAddress = 456.try_into().unwrap();
    let token_id: u256 = 1.into();
    let attacker: ContractAddress = 789.try_into().unwrap();

    // Setup cheat to set caller address to the attacker
    start_cheat_caller_address(acheivement_nft.contract_address, attacker);

    // Attempt to award the NFT without being the owner
    match safe_dispatcher.award_nft(recipient, token_id) {
        Result::Ok(_) => panic!("Cannot award NFT"),
        Result::Err(e) => assert(*e[0] == 'Caller is not the owner', *e.at(0)),
    }
}
