#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage};
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };
    use starknet::{ContractAddress, contract_address_const, testing};

    use engine::systems::play::{play, IPlayDispatcher};
    use engine::systems::start::{start, IStartDispatcher, IStartDispatcherTrait};
    use engine::systems::read_board::{read_board, IReadBoardDispatcher};
    use engine::models::{Board, m_Board, Player, m_Player, Matchmaker, m_Matchmaker};

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "engine",
            resources: [
                TestResource::Model(m_Board::TEST_CLASS_HASH),
                TestResource::Model(m_Player::TEST_CLASS_HASH),
                TestResource::Model(m_Matchmaker::TEST_CLASS_HASH),
                TestResource::Contract(play::TEST_CLASS_HASH),
                TestResource::Contract(start::TEST_CLASS_HASH),
                TestResource::Contract(read_board::TEST_CLASS_HASH),
                TestResource::Event(play::e_Marked::TEST_CLASS_HASH),
                TestResource::Event(play::e_Ended::TEST_CLASS_HASH),
                TestResource::Event(start::e_Created::TEST_CLASS_HASH),
                TestResource::Event(start::e_Started::TEST_CLASS_HASH),
            ]
                .span(),
        };
        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"engine", @"play")
                .with_writer_of([dojo::utils::bytearray_hash(@"engine")].span()),
            ContractDefTrait::new(@"engine", @"start")
                .with_writer_of([dojo::utils::bytearray_hash(@"engine")].span()),
            ContractDefTrait::new(@"engine", @"read_board")
                .with_writer_of([dojo::utils::bytearray_hash(@"engine")].span()),
        ]
            .span()
    }

    #[derive(Drop, Copy)]
    pub struct GameContext {
        pub world: WorldStorage,
        pub play_dispatcher: IPlayDispatcher,
        pub start_dispatcher: IStartDispatcher,
        pub board_dispatcher: IReadBoardDispatcher,
    }

    fn setup_world() -> GameContext {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (play_contract, _) = world.dns(@"play").unwrap();
        let (start_contract, _) = world.dns(@"start").unwrap();
        let (board_contract, _) = world.dns(@"read_board").unwrap();
        let play_dispatcher = IPlayDispatcher { contract_address: play_contract };
        let start_dispatcher = IStartDispatcher { contract_address: start_contract };
        let board_dispatcher = IReadBoardDispatcher { contract_address: board_contract };

        GameContext { world, play_dispatcher, start_dispatcher, board_dispatcher }
    }

    fn init_default_game(context: @GameContext) -> (ContractAddress, ContractAddress, u32) {
        let player_1 = contract_address_const::<'PLAYER 1'>();
        let player_2 = contract_address_const::<'PLAYER 2'>();

        testing::set_contract_address(player_1);
        (*context.start_dispatcher).start();
        let matchmaker: Matchmaker = context.world.read_model(1);
        let match_id = matchmaker.last_board;

        testing::set_contract_address(player_2);
        (*context.start_dispatcher).join(match_id);

        (player_1, player_2, match_id)
    }

    /// TESTS

    #[test]
    fn test_start_creates_new_match() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.start();

        let matchmaker: Matchmaker = context.world.read_model(1);
        let match_id = matchmaker.last_board;
        let board: Board = context.world.read_model(match_id);

        assert(board.x == player1, 'P1 not X');
        assert(!board.ready, 'Board not ready');
        assert(matchmaker.last_board == match_id, 'Last board error');
        assert(!matchmaker.last_board_ready, 'Last flag error');
    }

    #[test]
    fn test_start_join_existing_match() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        let player2 = contract_address_const::<'PLAYER2'>();

        testing::set_contract_address(player1);
        context.start_dispatcher.start();
        let matchmaker: Matchmaker = context.world.read_model(1);
        let match_id = matchmaker.last_board;

        testing::set_contract_address(player2);
        context.start_dispatcher.join(match_id);

        let board: Board = context.world.read_model(match_id);
        assert(board.o == player2, 'P2 not O');
        assert(board.ready, 'Board not ready');

        let matchmaker: Matchmaker = context.world.read_model(1);
        assert(matchmaker.last_board_ready, 'Last flag false');
    }

    #[test]
    fn test_start_private_creates_match() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.start_private();

        let player_info: Player = context.world.read_model(player1);
        let match_id = player_info.match_id;
        let board: Board = context.world.read_model(match_id);

        assert(board.x == player1, 'P1 not X');
        assert(!board.ready, 'Board ready');
        assert(!player_info.turn, 'Turn flag error');
    }

    #[test]
    fn test_multiple_private_games() {
        let mut context = setup_world();

        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.start_private();
        let player_info1: Player = context.world.read_model(player1);
        let match_id1 = player_info1.match_id;

        let player3 = contract_address_const::<'PLAYER3'>();
        testing::set_contract_address(player3);
        context.start_dispatcher.start_private();
        let player_info3: Player = context.world.read_model(player3);
        let match_id2 = player_info3.match_id;

        assert(match_id1 != match_id2, 'Match id eq');
    }

    #[test]
    fn test_start_after_full_match() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        let player2 = contract_address_const::<'PLAYER2'>();
        let player3 = contract_address_const::<'PLAYER3'>();

        testing::set_contract_address(player1);
        context.start_dispatcher.start();
        let matchmaker: Matchmaker = context.world.read_model(1);
        let match_id1 = matchmaker.last_board;

        testing::set_contract_address(player2);
        context.start_dispatcher.join(match_id1);

        testing::set_contract_address(player3);
        context.start_dispatcher.start();
        let matchmaker: Matchmaker = context.world.read_model(1);
        let match_id2 = matchmaker.last_board;

        let board: Board = context.world.read_model(match_id2);
        assert(board.x == player3, 'P3 not X');
        assert(!board.ready, 'Flag err');
        assert(matchmaker.last_board == match_id2, 'Bad bid');
        assert(!matchmaker.last_board_ready, 'Bad flag');
        assert(match_id1 != match_id2, 'Match id collision');
    }

    #[test]
    #[should_panic(expected: ('Board does not exist', 'ENTRYPOINT_FAILED'))]
    fn test_join_invalid_board() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.join(999999);
    }

    #[test]
    fn test_start_twice_same_player() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.start();
        let matchmaker: Matchmaker = context.world.read_model(1);
        let match_id = matchmaker.last_board;
        context.start_dispatcher.join(match_id);

        let board: Board = context.world.read_model(match_id);
        assert(board.x == player1, 'P1 as X');
        assert(board.o == player1, 'P1 as O');
        assert(board.ready, 'Not ready');
    }
}
