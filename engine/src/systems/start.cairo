use engine::models::{Position};

#[starknet::interface]
pub trait IStart<T> {
    fn start(ref self: T);
    fn start_private(ref self: T);
    fn join(ref self: T, match_id: u32);
}

#[dojo::contract]
pub mod start {
    use core::num::traits::Zero;
    use super::{IStart, Position};
    use core::poseidon::PoseidonTrait;
    use core::hash::HashStateTrait;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
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

    #[abi(embed_v0)]
    impl ActionsImpl of IStart<ContractState> {
        fn start(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let matchmaker: Matchmaker = world.read_model(1);

            if matchmaker.last_board_ready || matchmaker.last_board == 0 {
                let zero_address: ContractAddress = 0.try_into().unwrap();
                let match_id = matchmaker.next_match_id;
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
                        @Matchmaker {
                            server: 1,
                            last_board: match_id,
                            last_board_ready: false,
                            next_match_id: match_id + 1,
                        },
                    );
                world.emit_event(@Created { match_id, server: 1 });
            } else {
                let board: Board = world.read_model(matchmaker.last_board);
                assert(board.o.is_zero(), 'Board already has player O');
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
                            server: 1,
                            last_board: matchmaker.last_board,
                            last_board_ready: true,
                            next_match_id: matchmaker.next_match_id,
                        },
                    );
                world.emit_event(@Started { match_id: board.match_id, x: board.x, o: player });
            }
        }


        fn start_private(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let zero_address: ContractAddress = 0.try_into().unwrap();
            let match_id: u32 = self._generate_match_id(player, world);
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
            let player_info = Player { address: player, match_id, marks: array![], turn: false };
            world.write_model(@player_info);
            world.write_model(@board);
            world.emit_event(@Created { match_id, server: 1 });
        }

        fn join(ref self: ContractState, match_id: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let matchmaker: Matchmaker = world.read_model(1);
            let board: Board = world.read_model(match_id);
            assert(!board.x.is_zero(), 'Board does not exist'); // Ensure board exists
            assert(board.o.is_zero(), 'Board already has player O');
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
            if match_id == matchmaker.last_board {
                world
                    .write_model(
                        @Matchmaker {
                            server: 1,
                            last_board: matchmaker.last_board,
                            last_board_ready: true,
                            next_match_id: matchmaker.next_match_id,
                        },
                    );
            }
            world.emit_event(@Started { match_id: board.match_id, x: board.x, o: player });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"engine")
        }

        // Hash caller address with current block timestamp to generate match id, ensure uniqueness
        // and no u32 overflow
        fn _generate_match_id(
            self: @ContractState, caller: ContractAddress, world: dojo::world::WorldStorage,
        ) -> u32 {
            let timestamp = get_block_timestamp();
            let hash: u256 = PoseidonTrait::new()
                .update(caller.into())
                .update(timestamp.into())
                .finalize()
                .try_into()
                .unwrap();

            let mut id: u32 = (hash % 0x100000000_u256) //  0x100000000 = u32::MAX + 1
                .try_into()
                .unwrap();
            let board: Board = world.read_model(id);

            if board.active {
                return ((id + 1).into() % 0x100000000_u256).try_into().unwrap();
            }
            id
        }
    }
}
