#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::ModelStorage;
    use dojo::world::WorldStorageTrait;
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };

    use engine::systems::actions::{
        actions, IActionsDispatcher, IActionsDispatcherTrait, array_contains_position,
    };
    use engine::models::{Matchmaker, Board, Player, Position, m_Matchmaker, m_Board, m_Player};
    use actions::{e_Created, e_Started, e_Marked, e_Ended};

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "engine", resources: [
                TestResource::Model(m_Matchmaker::TEST_CLASS_HASH),
                TestResource::Model(m_Board::TEST_CLASS_HASH),
                TestResource::Model(m_Player::TEST_CLASS_HASH),
                TestResource::Event(e_Created::TEST_CLASS_HASH),
                TestResource::Event(e_Started::TEST_CLASS_HASH),
                TestResource::Event(e_Marked::TEST_CLASS_HASH),
                TestResource::Event(e_Ended::TEST_CLASS_HASH),
                TestResource::Contract(actions::TEST_CLASS_HASH),
            ].span(),
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"engine", @"actions")
                .with_writer_of([dojo::utils::bytearray_hash(@"engine")].span())
        ].span()
    }


    #[test]
    fn test_start() {
        let zero: ContractAddress = 0.try_into().unwrap();
        let mut empty_board: Array<Position> = array![];
        for i in 1..4_u8 {
            for j in 1..4_u8 {
                empty_board.append(Position { i, j });
            }
        };

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.start();

        let matchmaker1: Matchmaker = world.read_model(1);
        let board1: Board = world.read_model(matchmaker1.last_board);
        let player1: Player = world.read_model(board1.x);

        let mut mm = Matchmaker { server: 1, last_board: 1, last_board_ready: false };
        let mut board = Board {
            match_id: 1,
            x: player1.address,
            o: zero,
            empty: empty_board,
            winner: zero,
            active: true,
            ready: false,
        };
        let mut player = Player { address: board1.x, match_id: 1, marks: array![], turn: false };

        assert(mm == matchmaker1, 'matchmaker is wrong');
        assert(board == board1, 'board is wrong');
        assert(player == player1, 'player is wrong');

        actions_system.start();

        let matchmaker2: Matchmaker = world.read_model(1);
        let board2: Board = world.read_model(matchmaker2.last_board);
        let player2: Player = world.read_model(board2.o);

        mm.last_board_ready = true;
        board.o = board2.o;
        board.ready = true;
        player.address = board2.o;
        player.turn = true;

        assert(mm == matchmaker2, 'matchmaker is wrong');
        assert(board == board2, 'board is wrong');
        assert(player == player2, 'player is wrong');

        actions_system.start();

        let matchmaker3: Matchmaker = world.read_model(1);
        let board3: Board = world.read_model(matchmaker3.last_board);
        let player3: Player = world.read_model(board3.o);

        mm.last_board = 2;
        mm.last_board_ready = false;
        board.o = zero;
        board.ready = false;
        board.match_id = 2;
        player.address = board2.x;
        player.turn = false;
        player.match_id = 2;

        assert(mm == matchmaker3, 'matchmaker is wrong');
        assert(board == board3, 'board is wrong');
        assert(player == player3, 'player is wrong');
    }

    #[test]
    fn test_start_private() {
        let zero: ContractAddress = 0.try_into().unwrap();
        let mut empty_board: Array<Position> = array![];
        for i in 1..4_u8 {
            for j in 1..4_u8 {
                empty_board.append(Position { i, j });
            }
        };

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.start_private();

        let matchmaker1: Matchmaker = world.read_model(1);
        let board1: Board = world.read_model(matchmaker1.last_board);
        let player1: Player = world.read_model(board1.x);

        let mut mm = Matchmaker { server: 1, last_board: 1, last_board_ready: true };
        let board = Board {
            match_id: 1,
            x: player1.address,
            o: zero,
            empty: empty_board,
            winner: zero,
            active: true,
            ready: true,
        };
        let mut player = Player { address: board1.x, match_id: 1, marks: array![], turn: false };

        assert(mm == matchmaker1, 'matchmaker is wrong');
        assert(board == board1, 'board is wrong');
        assert(player == player1, 'player is wrong');
    }

    #[test]
    fn test_join() {
        let zero: ContractAddress = 0.try_into().unwrap();
        let mut empty_board: Array<Position> = array![];
        for i in 1..4_u8 {
            for j in 1..4_u8 {
                empty_board.append(Position { i, j });
            }
        };

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.start_private();

        let matchmaker1: Matchmaker = world.read_model(1);

        actions_system.join(matchmaker1.last_board);

        let matchmaker2: Matchmaker = world.read_model(1);
        let board1: Board = world.read_model(matchmaker2.last_board);
        let player1: Player = world.read_model(board1.x);

        let mut mm = Matchmaker { server: 1, last_board: 1, last_board_ready: true };
        let board = Board {
            match_id: 1,
            x: board1.x,
            o: player1.address,
            empty: empty_board,
            winner: zero,
            active: true,
            ready: true,
        };
        let mut player = Player { address: board1.x, match_id: 1, marks: array![], turn: true };

        assert(mm == matchmaker2, 'matchmaker is wrong');
        assert(board == board1, 'board is wrong');
        assert(player == player1, 'player is wrong');
    }

    #[test]
    fn test_mark() {
        let mut empty_board: Array<Position> = array![];
        for i in 1..4_u8 {
            for j in 1..4_u8 {
                empty_board.append(Position { i, j });
            }
        };

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.start();
        actions_system.start();

        actions_system.mark(Position { i: 1, j: 1 });

        let matchmaker1: Matchmaker = world.read_model(1);
        let board1: Board = world.read_model(matchmaker1.last_board);
        let player1: Player = world.read_model(board1.x);

        assert(
            array_contains_position(@player1.marks, Position { i: 1, j: 1 }), 'player1 not marked',
        );
        assert(
            !array_contains_position(@board1.empty, Position { i: 1, j: 1 }), 'board1 still marked',
        );
    }

    #[test]
    fn test_leave() {
        let zero: ContractAddress = 0.try_into().unwrap();
        let mut empty_board: Array<Position> = array![];
        for i in 1..4_u8 {
            for j in 1..4_u8 {
                empty_board.append(Position { i, j });
            }
        };

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.start();
        actions_system.start();

        actions_system.leave();

        let matchmaker1: Matchmaker = world.read_model(1);
        let board1: Board = world.read_model(matchmaker1.last_board);
        let player1: Player = world.read_model(board1.x);

        let mut board = Board {
            match_id: 1,
            x: player1.address,
            o: zero,
            empty: empty_board,
            winner: board1.o,
            active: false,
            ready: true,
        };
        let mut player = Player { address: board1.x, match_id: 0, marks: array![], turn: false };

        assert(board == board1, 'board is wrong');
        assert(player == player1, 'player is wrong');
    }

    #[test]
    fn test_read_board() {
        let mut empty_board: Array<Position> = array![];
        for i in 1..4_u8 {
            for j in 1..4_u8 {
                empty_board.append(Position { i, j });
            }
        };

        let player_board: Array<Position> = array![Position { i: 1, j: 1 }];

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        actions_system.start();
        actions_system.start();

        actions_system.mark(Position { i: 1, j: 1 });
        let (res_empty, res_x, res_o) = actions_system.read_board();

        assert(
            !array_contains_position(@res_empty, Position { i: 1, j: 1 }), 'empty board is wrong',
        );
        assert(res_empty.len() == 8, 'empty board is wrong');
        assert(res_x == player_board, 'x board is wrong');
        assert(res_o == player_board, 'o board is wrong');
    }
}
