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

    fn feign_win(players: Array<ContractAddress>, context: GameContext, match_id: u32) {
        let mut current_pos = 1; // Player 2 starts
        let player_moves: Array<Position> = array![
            Position { i: 1, j: 1 }, // P2
            Position { i: 1, j: 2 }, // P1
            Position { i: 2, j: 1 }, // P2
            Position { i: 2, j: 2 }, // P1
            Position { i: 3, j: 1 } // P2 wins (vertical j=1)
        ];

        let mut i = 0;
        while i < player_moves.len() {
            let position = *player_moves.at(i);
            let current_player = *players.at(current_pos);
            testing::set_contract_address(current_player);
            context.play_dispatcher.mark(position);
            current_pos = (current_pos + 1) % 2;
            println!("Player {:?}: marked at {} {}", current_player, position.i, position.j);
            i += 1;
        };

        let board: Board = context.world.read_model(match_id);
        assert(board.winner == *players.at(1), 'FEIGN WIN ERROR');
    }

    /// TESTS

    #[test]
    fn test_play_mark_success() {
        let mut context = setup_world();
        let (player_1, player_2, match_id) = init_default_game(@context);

        testing::set_contract_address(player_2);
        let position = Position { i: 2, j: 2 };
        context.play_dispatcher.mark(position);

        let board: Board = context.world.read_model(match_id);
        let player: Player = context.world.read_model(player_2);
        assert(board.empty.len() == 8, 'Position not marked');
        assert(player.marks.len() == 1, 'Mark not added');
        assert(!player.turn, 'OUT OF TURN');
        let event = play::Marked { player: player_2, position, symbol: false }; // O is false
        context.world.emit_event_test(@event);
    }

    #[test]
    fn test_play_should_allow_a_player_win() {
        let mut context = setup_world();
        let (player_1, player_2, match_id) = init_default_game(@context);
        feign_win(array![player_1, player_2], context, match_id);

        let event = play::Ended { match_id, winner: player_2, finished: true };
        context.world.emit_event_test(@event);
    }
}
