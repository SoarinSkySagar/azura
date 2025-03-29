#[cfg(test)]
mod tests {
    use dojo::event::EventStorageTest;
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage, ModelValueStorage, ModelStorageTest};
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };
    use starknet::{ContractAddress, contract_address_const, testing};

    use engine::systems::play::{play, IPlayDispatcher, IPlayDispatcherTrait};
    use engine::systems::start::{start, IStartDispatcher, IStartDispatcherTrait};
    use engine::systems::read_board::{read_board, IReadBoardDispatcher, IReadBoardDispatcherTrait};
    use engine::systems::leave::{leave, ILeaveDispatcher, ILeaveDispatcherTrait};
    use engine::models::{Board, m_Board, Player, m_Player, Matchmaker, m_Matchmaker, Position};

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
                TestResource::Contract(leave::TEST_CLASS_HASH),
                TestResource::Event(play::e_Marked::TEST_CLASS_HASH),
                TestResource::Event(play::e_Ended::TEST_CLASS_HASH),
                TestResource::Event(start::e_Created::TEST_CLASS_HASH),
                TestResource::Event(start::e_Started::TEST_CLASS_HASH),
                TestResource::Event(leave::e_Ended::TEST_CLASS_HASH),
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
            ContractDefTrait::new(@"engine", @"leave")
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
        pub leave_dispatcher: ILeaveDispatcher,
    }

    fn setup_world() -> GameContext {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (play_contract, _) = world.dns(@"play").unwrap();
        let (start_contract, _) = world.dns(@"start").unwrap();
        let (board_contract, _) = world.dns(@"read_board").unwrap();
        let (leave_contract, _) = world.dns(@"leave").unwrap();
        let play_dispatcher = IPlayDispatcher { contract_address: play_contract };
        let start_dispatcher = IStartDispatcher { contract_address: start_contract };
        let board_dispatcher = IReadBoardDispatcher { contract_address: board_contract };
        let leave_dispatcher = ILeaveDispatcher { contract_address: leave_contract };

        GameContext { world, play_dispatcher, start_dispatcher, board_dispatcher, leave_dispatcher }
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
    fn test_leave_player_x_forfeits() {
        let mut context = setup_world();
        let (player_1, player_2, match_id) = init_default_game(@context);

        // Player X (player_1) leaves the game
        testing::set_contract_address(player_1);
        context.leave_dispatcher.leave();

        // Check that the game is no longer active and player O (player_2) is declared winner
        let board: Board = context.world.read_model(match_id);

        assert(!board.active, 'Board should be inactive');
        assert(board.winner == player_2, 'Player O should win');

        // Verify both players are reset
        let player_1_info: Player = context.world.read_model(player_1);
        let player_2_info: Player = context.world.read_model(player_2);

        assert(player_1_info.match_id == 0, 'Player X match_id not reset');
        assert(player_2_info.match_id == 0, 'Player O match_id not reset');
        assert(player_1_info.marks.len() == 0, 'Player X marks not reset');
        assert(player_2_info.marks.len() == 0, 'Player O marks not reset');

        // Verify that the Ended event was emitted
        let event = leave::Ended { match_id, winner: player_2, finished: false };
        context.world.emit_event_test(@event);
    }

    #[test]
    fn test_leave_player_o_forfeits() {
        let mut context = setup_world();
        let (player_1, player_2, match_id) = init_default_game(@context);

        // Player O (player_2) leaves the game
        testing::set_contract_address(player_2);
        context.leave_dispatcher.leave();

        // Check that the game is no longer active and player X (player_1) is declared winner
        let board: Board = context.world.read_model(match_id);

        assert(!board.active, 'Board should be inactive');
        assert(board.winner == player_1, 'Player X should win');

        // Verify both players are reset
        let player_1_info: Player = context.world.read_model(player_1);
        let player_2_info: Player = context.world.read_model(player_2);

        assert(player_1_info.match_id == 0, 'Player X match_id not reset');
        assert(player_2_info.match_id == 0, 'Player O match_id not reset');
        assert(player_1_info.marks.len() == 0, 'Player X marks not reset');
        assert(player_2_info.marks.len() == 0, 'Player O marks not reset');

        // Verify that the Ended event was emitted
        let event = leave::Ended { match_id, winner: player_1, finished: false };
        context.world.emit_event_test(@event);
    }

    #[test]
    fn test_leave_after_moves() {
        let mut context = setup_world();
        let (player_1, player_2, match_id) = init_default_game(@context);

        // Make a few moves first
        testing::set_contract_address(player_2); // Player O starts
        context.play_dispatcher.mark(Position { i: 1, j: 1 });

        testing::set_contract_address(player_1); // Player X turn
        context.play_dispatcher.mark(Position { i: 2, j: 2 });

        // Player O leaves mid-game
        testing::set_contract_address(player_2);
        context.leave_dispatcher.leave();

        // Check that the game is no longer active and player X is declared winner
        let board: Board = context.world.read_model(match_id);

        assert(!board.active, 'Board should be inactive');
        assert(board.winner == player_1, 'Player X should win');

        // Verify players are reset
        let player_1_info: Player = context.world.read_model(player_1);
        let player_2_info: Player = context.world.read_model(player_2);

        assert(player_1_info.match_id == 0, 'Player X match_id not reset');
        assert(player_2_info.match_id == 0, 'Player O match_id not reset');

        // Verify that the Ended event was emitted with finished=false
        let event = leave::Ended { match_id, winner: player_1, finished: false };
        context.world.emit_event_test(@event);
    }

    #[test]
    #[should_panic(expected: ('ENTRYPOINT_FAILED'))]
    fn test_leave_without_active_game() {
        let mut context = setup_world();

        // Player that isn't in a game tries to leave
        let random_player = contract_address_const::<'RANDOM PLAYER'>();
        testing::set_contract_address(random_player);

        // This should fail because the player isn't in a game
        context.leave_dispatcher.leave();
    }

    #[test]
    fn test_leave_and_start_new_game() {
        let mut context = setup_world();
        let (player_1, player_2, match_id) = init_default_game(@context);

        // Player X leaves the game
        testing::set_contract_address(player_1);
        context.leave_dispatcher.leave();

        // Verify player O wins and game is inactive
        let board: Board = context.world.read_model(match_id);
        assert(!board.active, 'Board should be inactive');
        assert(board.winner == player_2, 'Player O should win');

        // Player X starts a new game
        context.start_dispatcher.start();

        // Get the new match ID
        let matchmaker: Matchmaker = context.world.read_model(1);
        let new_match_id = matchmaker.last_board;

        // Verify it's a different game
        assert(new_match_id != match_id, 'Should be a new match');

        // Check that player X is properly registered in the new game
        let player_1_info: Player = context.world.read_model(player_1);
        assert(player_1_info.match_id == new_match_id, 'Player not in new match');

        // New board should have player X and be waiting for player O
        let new_board: Board = context.world.read_model(new_match_id);
        assert(new_board.x == player_1, 'Player not X in new game');
        assert(!new_board.ready, 'Board should not be ready');
    }
}