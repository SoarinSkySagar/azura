#[cfg(test)]
mod tests {
    use dojo::event::EventStorageTest;
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage};
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };
    use starknet::{ContractAddress, contract_address_const, testing};

    use engine::systems::play::{play, IPlayDispatcher, IPlayDispatcherTrait};
    use engine::systems::start::{start, IStartDispatcher, IStartDispatcherTrait};
    use engine::systems::read_board::{read_board, IReadBoardDispatcher, IReadBoardDispatcherTrait};
    use engine::models::{Board, m_Board, Player, m_Player, m_Matchmaker, Position};

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

    fn feign_win(players: Array<ContractAddress>, context: GameContext) {
        let (mut available_positions, _) = context.board_dispatcher.read_board();
        // we build a moves array of length 21 so that moves at indices 2, 11, and 20 are the
        // winning moves.
        // The winning moves assign board cells:
        // available_positions[0] -> (0,0)
        // available_positions[1] -> (0,1)
        // available_positions[2] -> (0,2)
        // All other moves take positions far from the top row.
        let moves: Array<usize> = array![
            30, // move 0: safe move (player9)
            31, // move 1: safe move (player1)
            0, // move 2: winning move for player2: (0,0)
            32, // move 3: safe (player3)
            33, // move 4: safe (player4)
            34, // move 5: safe (player5)
            35, // move 6: safe (player6)
            36, // move 7: safe (player7)
            37, // move 8: safe (player8)
            38, // move 9: safe (player9)
            39, // move 10: safe (player1)
            1, // move 11: winning move for player2: (0,1)
            40, // move 12: safe (player3)
            41, // move 13: safe (player4)
            42, // move 14: safe (player5)
            43, // move 15: safe (player6)
            44, // move 16: safe (player7)
            45, // move 17: safe (player8)
            46, // move 18: safe (player9)
            47, // move 19: safe (player1)
            2 // move 20: winning move for player2: (0,2)
        ];

        let num_moves = moves.len();
        let starting_index = 8; // starting with player9
        for i in 0..num_moves {
            let current_player = *players.at((starting_index + i) % 9);
            let position = *available_positions.at(*moves[i]);
            testing::set_contract_address(current_player);
            context.play_dispatcher.mark(position);
        };

        // After these moves, player2 (players.at(1)) should have marked (0,0), (0,1), and (0,2),
        // triggering the 3-in-a-row win condition.
        let board: Board = context.world.read_model(123456);
        assert(board.winner == *players.at(1), 'FEIGN WIN ERROR');
    }

    /// TESTS

    #[test]
    fn test_play_mark_success() {
        let mut context = setup_world();
        // Start a default game with join.
        let (_, _, _, _, _, _, _, _, player9) = init_default_game(context.start_dispatcher);

        let (_, all_marks) = context.board_dispatcher.read_board();
        assert(all_marks[8].len() == 0, 'INIT FAILURE');

        // play, say center
        testing::set_contract_address(player9);
        let position = Position { i: 2, j: 2 };
        context.play_dispatcher.mark(position);
        let (_, all_marks) = context.board_dispatcher.read_board();
        assert(*all_marks[8][0] == position, '1. MARK FAILED');
        let event = play::Marked { player: player9, position, symbol: true };
        context.world.emit_event_test(@event);

        // next player
        let player: Player = context.world.read_model(player9);
        assert(!player.turn, 'OUT OF TURN');
    }

    #[test]
    fn test_play_should_allow_a_player_win() {
        let mut context = setup_world();
        let (player1, player2, player3, player4, player5, player6, player7, player8, player9) =
            init_default_game(
            context.start_dispatcher,
        );
        feign_win(
            array![player1, player2, player3, player4, player5, player6, player7, player8, player9],
            context,
        );
        let event = play::Ended { match_id: 12345, winner: player2, finished: true };
        context.world.emit_event_test(@event);
    }

    #[test]
    fn test_turn_update_after_move() {
        let mut context = setup_world();
        // Start the game with 9 players joining.
        let (player1, _, _, _, _, _, _, _, player9) = init_default_game(context.start_dispatcher);

        // At game start, assume the last joined player (PLAYER9) is the current turn.
        // Simulate a move for PLAYER9.
        testing::set_contract_address(player9);
        let move_position = Position { i: 2, j: 2 }; // an arbitrary safe move
        context.play_dispatcher.mark(move_position);

        // Verify that after marking, PLAYER9's turn flag is false.
        let player9_record: Player = context.world.read_model(player9);
        assert(!player9_record.turn, 'PLAYER9 turn flag set to false');

        // Now, the turn should cycle to the next player.
        // Based on the join order, the next turn should be for PLAYER1.
        let player1_record: Player = context.world.read_model(player1);
        assert(player1_record.turn, 'PLAYER1 should have the turn');
    }
    // #[test]
// #[should_panic(expected: 'Match no longer Active')]
// fn test_play_mark_should_panic_for_invalid_player() {
//     // From the code implementation, this error message is inevitable for this scenario
//     let context = setup_world();
//     let (_, _) = init_default_game(context.start_dispatcher);

    //     let invalid_player = contract_address_const::<'INVALID PLAYER'>();
//     testing::set_contract_address(invalid_player);
//     let position = Position { i: 2, j: 2 };
//     context.play_dispatcher.mark(position);
// }

    // #[test]
// #[should_panic(expected: 'Position already marked')]
// fn test_play_mark_should_panic_on_already_marked_position() {
//     let context = setup_world();
//     let (player_1, player_2) = init_default_game(context.start_dispatcher);
//     let position = Position { i: 2, j: 2 };
//     testing::set_contract_address(player_2);
//     context.play_dispatcher.mark(position);

    //     testing::set_contract_address(player_1);
//     context.play_dispatcher.mark(position); // should panic
// }

    // #[test]
// #[should_panic(expected: 'Not your turn')]
// fn test_play_should_panic_on_player_misturn() {
//     let context = setup_world();
//     let (player_1, player_2) = init_default_game(context.start_dispatcher);
//     let position = Position { i: 2, j: 2 };
//     testing::set_contract_address(player_2);
//     context.play_dispatcher.mark(position);

    //     let position = Position { i: 1, j: 1 };
//     testing::set_contract_address(player_1);
//     context.play_dispatcher.mark(position);

    //     let position = Position { i: 2, j: 1 };
//     context.play_dispatcher.mark(position);
// }

    // #[test]
// #[should_panic(expected: 'Match no longer Active')]
// fn test_play_should_panic_on_match_ended() {
//     let context = setup_world();
//     let (player_1, player_2) = init_default_game(context.start_dispatcher);
//     feign_win(array![player_1, player_2], context);
//     // since player 2 has won, let player 1 make a move
//     let position = Position { i: 3, j: 1 };
//     context.play_dispatcher.mark(position);
// }
}

