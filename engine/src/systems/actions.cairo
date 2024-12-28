use engine::models::{Position};

#[starknet::interface]
trait IActions<T> {
    fn start(ref self: T);
    fn start_private(ref self: T);
    fn join(ref self: T, match_id: u32);
    fn mark(ref self: T, position: Position);
    fn leave(ref self: T);
    fn read_board(self: @T) -> (Array<Position>, Array<Position>, Array<Position>);
}

#[dojo::contract]
pub mod actions {
    use super::{IActions, Position};
    use starknet::{ContractAddress, get_caller_address};
    use engine::models::{Matchmaker, Board, Player};

    use dojo::model::{ModelStorage};
    use dojo::event::EventStorage;

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Created {
        #[key]
        pub match_id: u32,
        pub server: u8,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Started {
        #[key]
        pub match_id: u32,
        pub x: ContractAddress,
        pub o: ContractAddress,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Marked {
        #[key]
        pub player: ContractAddress,
        pub position: Position,
        pub symbol: bool,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct Ended {
        #[key]
        pub match_id: u32,
        pub winner: ContractAddress,
        pub finished: bool,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn start(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let matchmaker: Matchmaker = world.read_model(1);

            if matchmaker.last_board_ready {
                let zero_address: ContractAddress = 0.try_into().unwrap();
                let match_id = matchmaker.last_board + 1;
                let mut empty_board: Array<Position> = array![];
                for i in 1..4_u8 {
                    for j in 1..4_u8 {
                        empty_board.append(Position { i, j });
                    }
                };

                let board = Board {
                    match_id,
                    x: player,
                    o: zero_address,
                    empty: empty_board,
                    winner: zero_address,
                    active: true,
                    ready: false,
                };

                let player_info = Player {
                    address: player, match_id, marks: array![], turn: false,
                };

                world.write_model(@player_info);
                world.write_model(@board);
                world
                    .write_model(
                        @Matchmaker { server: 1, last_board: match_id, last_board_ready: false },
                    );
                world.emit_event(@Created { match_id, server: 1 });
            } else {
                let board: Board = world.read_model(matchmaker.last_board);

                let new_board = Board {
                    match_id: board.match_id,
                    x: board.x,
                    o: player,
                    empty: board.empty,
                    winner: board.winner,
                    active: board.active,
                    ready: true,
                };

                let player_info = Player {
                    address: player, match_id: board.match_id, marks: array![], turn: true,
                };

                world.write_model(@player_info);
                world.write_model(@new_board);
                world
                    .write_model(
                        @Matchmaker {
                            server: 1, last_board: matchmaker.last_board, last_board_ready: true,
                        },
                    );
                world.emit_event(@Started { match_id: board.match_id, x: board.x, o: player });
            }
        }
        fn start_private(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let matchmaker: Matchmaker = world.read_model(1);

            let zero_address: ContractAddress = 0.try_into().unwrap();
            let match_id = matchmaker.last_board + 1;
            let mut empty_board: Array<Position> = array![];
            for i in 1..4_u8 {
                for j in 1..4_u8 {
                    empty_board.append(Position { i, j });
                }
            };

            let board = Board {
                match_id,
                x: player,
                o: zero_address,
                empty: empty_board,
                winner: zero_address,
                active: true,
                ready: true,
            };

            let player_info = Player { address: player, match_id, marks: array![], turn: false };

            world.write_model(@player_info);
            world.write_model(@board);
            world
                .write_model(
                    @Matchmaker { server: 1, last_board: match_id, last_board_ready: true },
                );
            world.emit_event(@Created { match_id, server: 1 });
        }
        fn join(ref self: ContractState, match_id: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let matchmaker: Matchmaker = world.read_model(1);

            let board: Board = world.read_model(match_id);

            let zero_address: ContractAddress = 0.try_into().unwrap();
            assert(board.x != zero_address, 'Match not found');

            let new_board = Board {
                match_id,
                x: board.x,
                o: player,
                empty: board.empty,
                winner: board.winner,
                active: board.active,
                ready: true,
            };

            let player_info = Player {
                address: player, match_id: board.match_id, marks: array![], turn: true,
            };

            world.write_model(@player_info);
            world.write_model(@new_board);
            world
                .write_model(
                    @Matchmaker {
                        server: 1, last_board: matchmaker.last_board, last_board_ready: true,
                    },
                );
            world.emit_event(@Started { match_id: board.match_id, x: board.x, o: player });
        }
        fn mark(ref self: ContractState, position: Position) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let player_info: Player = world.read_model(player);
            let board: Board = world.read_model(player_info.match_id);

            assert(board.active, 'Match no longer active');
            assert(board.ready, 'Match not ready');
            assert(board.x == player || board.o == player, 'Not in this match');
            assert(player_info.turn, 'Not your turn');

            let mut player_x: Player = world.read_model(board.x);
            let mut player_o: Player = world.read_model(board.o);

            let board_empty = board.empty;
            let mut board_x = player_x.marks;
            let mut board_o = player_o.marks;

            let mut empty_board: Array<Position> = array![];
            for pos in board_empty {
                if pos != position {
                    empty_board.append(pos);
                }
            };

            if player == board.x {
                board_x.append(position);
                player_x =
                    Player {
                        address: player_x.address,
                        match_id: player_x.match_id,
                        marks: board_x,
                        turn: false,
                    };
                player_o =
                    Player {
                        address: player_o.address,
                        match_id: player_o.match_id,
                        marks: board_o,
                        turn: true,
                    };
            } else {
                board_o.append(position);
                player_o =
                    Player {
                        address: player_o.address,
                        match_id: player_o.match_id,
                        marks: board_o,
                        turn: false,
                    };
                player_x =
                    Player {
                        address: player_x.address,
                        match_id: player_x.match_id,
                        marks: board_x,
                        turn: true,
                    };
            }

            let new_board = Board {
                match_id: board.match_id,
                x: board.x,
                o: board.o,
                empty: empty_board,
                winner: board.winner,
                active: board.active,
                ready: board.ready,
            };

            world.write_model(@new_board);
            world.write_model(@player_x);
            world.write_model(@player_o);
            world.emit_event(@Marked { player, position, symbol: player == board.x });
        }
        fn leave(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let player_info: Player = world.read_model(player);

            let board: Board = world.read_model(player_info.match_id);

            let mut winner: ContractAddress = board.x;
            if player == board.x {
                winner = board.o;
            }

            let new_board = Board {
                match_id: board.match_id,
                x: board.x,
                o: board.o,
                empty: board.empty,
                winner,
                active: false,
                ready: true,
            };

            let player_x = Player { address: board.x, match_id: 0, marks: array![], turn: false };

            let player_o = Player { address: board.o, match_id: 0, marks: array![], turn: false };

            world.write_model(@new_board);
            world.write_model(@player_x);
            world.write_model(@player_o);
            world.emit_event(@Ended { match_id: board.match_id, winner, finished: false });
        }
        fn read_board(self: @ContractState) -> (Array<Position>, Array<Position>, Array<Position>) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let board: Board = world.read_model(player);

            let player_x: Player = world.read_model(board.x);
            let player_o: Player = world.read_model(board.o);

            let board_empty = board.empty;
            let board_x = player_x.marks;
            let board_o = player_o.marks;

            (board_empty, board_x, board_o)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"engine")
        }
    }
}
