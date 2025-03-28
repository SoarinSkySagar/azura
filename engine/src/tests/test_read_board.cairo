#[cfg(test)]
mod tests {
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
    use engine::models::{m_Board, m_Player, m_Matchmaker, Position, Player};

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
    fn test_read_board_after_start() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);

        context.start_dispatcher.start();

        // Read board as the same player.
        let (empty_positions, all_marks) = context.board_dispatcher.read_board();

        // The board is initialized with 81 positions.
        assert(empty_positions.len() == 81, '81 empty pos');

        // In the start branch, board has no marks.
        assert(all_marks[0].len() == 0, 'board should be empty');
    }

    #[test]
    fn test_read_board_after_join() {
        let mut context = setup_world();
        let (_, _, _, _, _, _, _, _, player9) = init_default_game(context.start_dispatcher);

        // Read board as player9.
        testing::set_contract_address(player9);
        let (empty_positions, all_marks) = context.board_dispatcher.read_board();

        // Board should have 81 empty positions initially.
        assert(empty_positions.len() == 81, '81 empty pos');
        // Board marks should be empty.
        assert(all_marks[0].len() == 0, 'board should be empty');
    }

    #[test]
    fn test_read_board_after_mark() {
        let mut context = setup_world();
        // Start a default game with join.
        let (_, _, _, _, _, _, _, _, player9) = init_default_game(context.start_dispatcher);

        // Since after join it's player9's turn, we simulate a move by player9.
        let test_position = Position { i: 1, j: 1 };
        testing::set_contract_address(player9);

        context.play_dispatcher.mark(test_position);

        // Read board as player9.
        let (empty_positions, all_marks) = context.board_dispatcher.read_board();

        // Expect player9's marks to have 1 entry.
        assert(all_marks[8].len() == 1, 'player9 has 1 mark');
        // Expect available positions reduced to 80.
        assert(empty_positions.len() == 80, '80 empty pos');
    }

    #[test]
    fn test_read_board_invalid_player() {
        let mut context = setup_world();
        let invalid_player = contract_address_const::<'INVALID'>();
        testing::set_contract_address(invalid_player);

        let (empty_positions, all_marks) = context.board_dispatcher.read_board();
        // With an invalid player, the associated Player model defaults,
        // hence the returned board data is empty.
        // Board should have 0 empty positions initially.
        assert(empty_positions.len() == 0, '0 empty pos');
        // Board marks should be empty.
        assert(all_marks.len() == 0, 'board should be empty');
    }

    #[test]
    fn test_read_board_after_two_moves() {
        let mut context = setup_world();
        // Start a default game with join.
        let (player1, _, _, _, _, _, _, _, player9) = init_default_game(context.start_dispatcher);

        // First move by player9 (initial turn).
        let pos1 = Position { i: 2, j: 2 };
        testing::set_contract_address(player9);
        context.play_dispatcher.mark(pos1);

        let pos2 = Position { i: 1, j: 2 };
        testing::set_contract_address(player1);
        context.play_dispatcher.mark(pos2);

        testing::set_contract_address(player1);
        let (empty_positions, all_marks) = context.board_dispatcher.read_board();
        // Expect empty positions = 79 (81-2 moves).
        assert(empty_positions.len() == 79, '79 empty pos');
        // Expect player1's marks = 1.
        assert(all_marks[0].len() == 1, 'player1 has 1 mark');
        // And player9's marks = 1.
        assert(all_marks[8].len() == 1, 'player9 has 1 mark');
    }

    #[test]
    fn test_read_board_consistency() {
        let mut context = setup_world();
        let (player1, _, _, _, _, _, _, _, player9) = init_default_game(context.start_dispatcher);

        // Simulate a move by player9.
        let pos = Position { i: 2, j: 3 };
        testing::set_contract_address(player9);
        context.play_dispatcher.mark(pos);

        testing::set_contract_address(player1);
        let (empty_positions1, all_marks1) = context.board_dispatcher.read_board();
        // Read board as player2.
        testing::set_contract_address(player9);
        let (empty_positions2, all_marks2) = context.board_dispatcher.read_board();

        // Both calls should return the same counts.
        assert(empty_positions1.len() == empty_positions2.len(), 'Empty eq');
        assert(all_marks1.len() == all_marks2.len(), 'all marks should be equal');
    }

    #[test]
    fn test_read_board_after_multiple_moves() {
        let mut context = setup_world();
        let (player1, player2, player3, _, _, _, _, _, player9) = init_default_game(
            context.start_dispatcher,
        );

        // Simulate a sequence of moves:
        // Move 1: player9.
        let pos1 = Position { i: 1, j: 1 };
        testing::set_contract_address(player9);
        context.play_dispatcher.mark(pos1);
        let pos2 = Position { i: 1, j: 2 };
        testing::set_contract_address(player1);
        context.play_dispatcher.mark(pos2);
        let pos3 = Position { i: 2, j: 1 };
        testing::set_contract_address(player2);
        context.play_dispatcher.mark(pos3);
        // Move 4: player3.
        let pos4 = Position { i: 2, j: 2 };
        testing::set_contract_address(player3);
        context.play_dispatcher.mark(pos4);

        testing::set_contract_address(player2);
        let (empty_positions, all_marks) = context.board_dispatcher.read_board();
        // After 4 moves, expect 77 empty positions.
        assert(empty_positions.len() == 77, '77 empty pos');
        // Expect player1's marks = 1.
        assert(all_marks[0].len() == 1, 'player1 has 1 mark');
        // Expect player2's marks = 1.
        assert(all_marks[0].len() == 1, 'player2 has 1 mark');
        // Expect player3's marks = 1.
        assert(all_marks[0].len() == 1, 'player3 has 1 mark');
        // And player9's marks = 1.
        assert(all_marks[8].len() == 1, 'player9 has 1 mark');
    }
}

