use starknet::ContractAddress;

#[starknet::interface]
pub trait IAchievementNFT<TContractState> {
    fn award_nft(
        ref self: TContractState,
        recipient: ContractAddress,
        token_id: u256
    );

    fn has_earned_achievement(self: @TContractState, recipient: ContractAddress) -> bool;

    #[external(v0)]
    fn set_achievement(ref self: TContractState, recipient: ContractAddress, has_achieved: bool);
}

#[starknet::contract]
pub mod AchievementNFT {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use starknet::ContractAddress;
    use super::IAchievementNFT;
    use starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
    };

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // ERC721 Mixin
    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        // Storage for achievements
        achievements: Map<ContractAddress, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        AchievementAwarded: AchievementAwarded,
    }

    #[derive(Drop, starknet::Event)]
    pub struct AchievementAwarded {
        pub recipient: ContractAddress,
        pub token_id: u256,
    }

    #[constructor]
    pub fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        base_uri: ByteArray,
        owner: ContractAddress
    ) {
        self.erc721.initializer(name, symbol, base_uri);
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl AchievementNFTImpl of IAchievementNFT<ContractState> {
        fn award_nft(
            ref self: ContractState,
            recipient: ContractAddress,
            token_id: u256
        ) {
            self.ownable.assert_only_owner();
            // Check if the user has earned the achievement
            assert(self.has_earned_achievement(recipient), 'Achievement not earned');

            // Mint the NFT
            self.erc721.mint(recipient, token_id);

            // Emit an event
            self.emit(Event::AchievementAwarded(AchievementAwarded {
                recipient,
                token_id,
            }));
        }

        fn has_earned_achievement(self: @ContractState, recipient: ContractAddress) -> bool {
            self.achievements.entry(recipient).read()
        }

        fn set_achievement(ref self: ContractState, recipient: ContractAddress, has_achieved: bool) {
            self.ownable.assert_only_owner();
            self.achievements.entry(recipient).write(has_achieved);
        }
    }
}
