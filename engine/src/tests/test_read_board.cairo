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

    fn init_default_game(dispatcher: IStartDispatcher) -> (ContractAddress, ContractAddress) {
        let player_1 = contract_address_const::<'PLAYER 1'>();
        let player_2 = contract_address_const::<'PLAYER 2'>();

        testing::set_contract_address(player_1);
        dispatcher.start();

        // Create a temporary world to read player_1's match_id
        let mut world = spawn_test_world([namespace_def()].span());
        world.sync_perms_and_inits(contract_defs());
        let player_1_info: Player = world.read_model(player_1);
        let match_id = player_1_info.match_id;

        testing::set_contract_address(player_2);
        dispatcher.join(match_id);

        (player_1, player_2)
    }

    /// TESTS

    #[test]
    fn test_read_board_after_start() {
        let mut context = setup_world();
        let player1 = contract_address_const::<'PLAYER1'>();
        testing::set_contract_address(player1);

        context.start_dispatcher.start();

        let (empty_positions, board_x, board_o) = context.board_dispatcher.read_board();
        assert(empty_positions.len() == 9, '9 empty pos');
        assert(board_x.len() == 0, 'X no marks');
        assert(board_o.len() == 0, 'O no marks');
    }

    #[test]
    fn test_read_board_after_join() {
        let mut context = setup_world();
        let (_, player2) = init_default_game(context.start_dispatcher);

        testing::set_contract_address(player2);
        let (empty_positions, board_x, board_o) = context.board_dispatcher.read_board();
        assert(empty_positions.len() == 9, '9 empty pos');
        assert(board_x.len() == 0, 'X no marks');
        assert(board_o.len() == 0, 'O no marks');
    }

    #[test]
    fn test_read_board_after_mark() {
        let mut context = setup_world();
        let (_, player2) = init_default_game(context.start_dispatcher);

        let test_position = Position { i: 1, j: 1 };
        testing::set_contract_address(player2);
        context.play_dispatcher.mark(test_position);

        testing::set_contract_address(player2);
        let (empty_positions, _, board_o) = context.board_dispatcher.read_board();
        assert(board_o.len() == 1, 'O has 1 mark');
        assert(empty_positions.len() == 8, '8 empty pos');
    }

    #[test]
    fn test_read_board_invalid_player() {
        let mut context = setup_world();
        let invalid_player = contract_address_const::<'INVALID'>();
        testing::set_contract_address(invalid_player);

        let (empty_positions, board_x, board_o) = context.board_dispatcher.read_board();
        assert(empty_positions.len() == 0, 'Empty pos');
        assert(board_x.len() == 0, 'X empty');
        assert(board_o.len() == 0, 'O empty');
    }

    #[test]
    fn test_read_board_after_two_moves() {
        let mut context = setup_world();
        let (player1, player2) = init_default_game(context.start_dispatcher);

        let pos1 = Position { i: 2, j: 2 };
        testing::set_contract_address(player2);
        context.play_dispatcher.mark(pos1);

        let pos2 = Position { i: 1, j: 2 };
        testing::set_contract_address(player1);
        context.play_dispatcher.mark(pos2);

        testing::set_contract_address(player1);
        let (empty_positions, board_x, board_o) = context.board_dispatcher.read_board();
        assert(empty_positions.len() == 7, '7 empty pos');
        assert(board_x.len() == 1, 'X has 1 mark');
        assert(board_o.len() == 1, 'O has 1 mark');
    }

    #[test]
    fn test_read_board_consistency() {
        let mut context = setup_world();
        let (player1, player2) = init_default_game(context.start_dispatcher);

        let pos = Position { i: 2, j: 3 };
        testing::set_contract_address(player2);
        context.play_dispatcher.mark(pos);

        testing::set_contract_address(player1);
        let (empty1, marks1_x, marks1_o) = context.board_dispatcher.read_board();
        testing::set_contract_address(player2);
        let (empty2, marks2_x, marks2_o) = context.board_dispatcher.read_board();

        assert(empty1.len() == empty2.len(), 'Empty eq');
        assert(marks1_x.len() == marks2_x.len(), 'X equal');
        assert(marks1_o.len() == marks2_o.len(), 'O equal');
    }

    #[test]
    fn test_read_board_after_multiple_moves() {
        let mut context = setup_world();
        let (player1, player2) = init_default_game(context.start_dispatcher);

        let pos1 = Position { i: 1, j: 1 };
        testing::set_contract_address(player2);
        context.play_dispatcher.mark(pos1);
        let pos2 = Position { i: 1, j: 2 };
        testing::set_contract_address(player1);
        context.play_dispatcher.mark(pos2);
        let pos3 = Position { i: 2, j: 1 };
        testing::set_contract_address(player2);
        context.play_dispatcher.mark(pos3);
        let pos4 = Position { i: 2, j: 2 };
        testing::set_contract_address(player1);
        context.play_dispatcher.mark(pos4);

        testing::set_contract_address(player2);
        let (empty_positions, board_x, board_o) = context.board_dispatcher.read_board();
        assert(empty_positions.len() == 5, '5 empty pos');
        assert(board_x.len() == 2, 'X 2 marks');
        assert(board_o.len() == 2, 'O 2 marks');
    }
}
