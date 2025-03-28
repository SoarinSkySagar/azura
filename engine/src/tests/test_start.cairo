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

    fn init_default_game(
        dispatcher: IStartDispatcher,
    ) -> (
        ContractAddress,
        ContractAddress,
        ContractAddress,
        ContractAddress,
        ContractAddress,
        ContractAddress,
        ContractAddress,
        ContractAddress,
        ContractAddress,
    ) {
        // Player 1 starts the game.
        let player1 = contract_address_const::<'PLAYER 1'>();
        testing::set_contract_address(player1);
        let match_id: u32 = 123456;
        dispatcher.start();

        // The remaining 8 players join the match.
        let player2 = contract_address_const::<'PLAYER 2'>();
        testing::set_contract_address(player2);
        dispatcher.join(match_id);

        let player3 = contract_address_const::<'PLAYER 3'>();
        testing::set_contract_address(player3);
        dispatcher.join(match_id);

        let player4 = contract_address_const::<'PLAYER 4'>();
        testing::set_contract_address(player4);
        dispatcher.join(match_id);

        let player5 = contract_address_const::<'PLAYER 5'>();
        testing::set_contract_address(player5);
        dispatcher.join(match_id);

        let player6 = contract_address_const::<'PLAYER 6'>();
        testing::set_contract_address(player6);
        dispatcher.join(match_id);

        let player7 = contract_address_const::<'PLAYER 7'>();
        testing::set_contract_address(player7);
        dispatcher.join(match_id);

        let player8 = contract_address_const::<'PLAYER 8'>();
        testing::set_contract_address(player8);
        dispatcher.join(match_id);

        let player9 = contract_address_const::<'PLAYER 9'>();
        testing::set_contract_address(player9);
        dispatcher.join(match_id);

        (player1, player2, player3, player4, player5, player6, player7, player8, player9)
    }

    /// TESTS

    #[test]
    fn test_start_creates_new_match() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.start();

        // The public start function uses a hardcoded match_id 123456 when creating a new board
        let board: Board = context.world.read_model(123456);

        let players = board.players;

        // Board.players[0] is set to the caller
        assert(*players[0] == player1, 'P1 not in first index');
        // Board.ready flag is false, since we're waiting for a second player
        assert(!board.ready, 'Board is ready');

        // Check matchmaker state recorded under key 1
        let matchmaker: Matchmaker = context.world.read_model(1);
        assert(matchmaker.last_board == 123456, 'Last board error');
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

        // Read board to confirm player2 was added in second index and board is updated.
        let board: Board = context.world.read_model(123456);

        assert(*board.players[1] == player2, 'P1 not in second index');
        assert(!board.ready, 'Board is ready');

        let matchmaker: Matchmaker = context.world.read_model(1);
        assert(!matchmaker.last_board_ready, 'Last flag false');
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
        // Private match assigns the caller as X and marks the board as immediately ready.
        assert(*board.players[0] == player1, 'P1 not in first index');
        assert(board.ready, 'Board not ready');

        // Read player info
        let player_info: Player = context.world.read_model(match_id);

        // In private mode the starting player does not take the turn immediately.
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
        let (_, _, _, _, _, _, _, _, _) = init_default_game(context.start_dispatcher);

        let player10 = contract_address_const::<'PLAYER10'>();
        // Now board is full; next start should create a new board.
        testing::set_contract_address(player10);

        context.start_dispatcher.start();
        let board: Board = context.world.read_model(123456);
        // New board should now have p3 as X with ready false.
        assert(*board.players[0] == player10, 'P10 not X');
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
        let board: Board = context.world.read_model(999999);

        // Expect board.players[0] to be player 1
        assert(*board.players[0] == player1, 'P1 not in first index');
        assert(!board.ready, 'board is ready');
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

        let board: Board = context.world.read_model(123456);
        // Since join() is called, board.o should be set to player1 and ready true.
        assert(*board.players[0] == player1, 'P1 not in first index');
        assert(*board.players[1] == player1, 'P1 not in second index');
        assert(!board.ready, 'board is ready');
    }

    #[test]
    fn test_start_private_same_player_twice() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.start_private();
        let matchmaker1: Matchmaker = context.world.read_model(1);
        let match_id1 = matchmaker1.last_board;
        // Second private game call.
        context.start_dispatcher.start_private();
        let matchmaker2: Matchmaker = context.world.read_model(1);
        let match_id2 = matchmaker2.last_board;

        assert(match_id1 != match_id2, 'Id coll');
    }

    #[test]
    fn test_start_board_size_and_capacity() {
        let mut context = setup_world();

        // Start a new match with PLAYER1.
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);
        context.start_dispatcher.start();

        // Read the board using the fixed match id 123456.
        let board: Board = context.world.read_model(123456);

        // Verify that the board's empty positions array holds 81 positions
        // (for a 9x9 board, 9*9 = 81).
        assert(board.empty.len() == 81, 'Board size is not 9x9');

        // Initially only the starting player is added.
        assert(board.players.len() == 1, 'Initial players count = 1');

        let player2 = contract_address_const::<'PLAYER2'>();
        let player3 = contract_address_const::<'PLAYER3'>();
        let player4 = contract_address_const::<'PLAYER4'>();
        let player5 = contract_address_const::<'PLAYER5'>();
        let player6 = contract_address_const::<'PLAYER6'>();
        let player7 = contract_address_const::<'PLAYER7'>();
        let player8 = contract_address_const::<'PLAYER8'>();
        let player9 = contract_address_const::<'PLAYER9'>();

        // Now let additional 8 players join the match.
        testing::set_contract_address(player2);
        context.start_dispatcher.join(123456);
        testing::set_contract_address(player3);
        context.start_dispatcher.join(123456);
        testing::set_contract_address(player4);
        context.start_dispatcher.join(123456);
        testing::set_contract_address(player5);
        context.start_dispatcher.join(123456);
        testing::set_contract_address(player6);
        context.start_dispatcher.join(123456);
        testing::set_contract_address(player7);
        context.start_dispatcher.join(123456);
        testing::set_contract_address(player8);
        context.start_dispatcher.join(123456);
        testing::set_contract_address(player9);
        context.start_dispatcher.join(123456);

        // Re-read the board to check updated status.
        let board_updated: Board = context.world.read_model(123456);
        // Now the board should have exactly 9 players.
        assert(board_updated.players.len() == 9, 'Players count = 9');
        // The board should be marked as ready when full.
        assert(board_updated.ready, 'Board should be ready');
    }
}

