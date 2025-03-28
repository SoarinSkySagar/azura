import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from 'starknet';

type WithFieldOrder<T> = T & { fieldOrder: string[] };

// Type definition for `engine::models::Board` struct
export interface Board {
	match_id: BigNumberish;
	x: string;
	o: string;
	empty: Array<Position>;
	winner: string;
	active: boolean;
	ready: boolean;
}

// Type definition for `engine::models::BoardValue` struct
export interface BoardValue {
	x: string;
	o: string;
	empty: Array<Position>;
	winner: string;
	active: boolean;
	ready: boolean;
}

// Type definition for `engine::models::Matchmaker` struct
export interface Matchmaker {
	server: BigNumberish;
	last_board: BigNumberish;
	last_board_ready: boolean;
}

// Type definition for `engine::models::MatchmakerValue` struct
export interface MatchmakerValue {
	last_board: BigNumberish;
	last_board_ready: boolean;
}

// Type definition for `engine::models::Player` struct
export interface Player {
	address: string;
	match_id: BigNumberish;
	marks: Array<Position>;
	turn: boolean;
}

// Type definition for `engine::models::PlayerValue` struct
export interface PlayerValue {
	match_id: BigNumberish;
	marks: Array<Position>;
	turn: boolean;
}

// Type definition for `engine::models::Position` struct
export interface Position {
	i: BigNumberish;
	j: BigNumberish;
}

export interface SchemaType extends ISchemaType {
	engine: {
		Board: WithFieldOrder<Board>,
		BoardValue: WithFieldOrder<BoardValue>,
		Matchmaker: WithFieldOrder<Matchmaker>,
		MatchmakerValue: WithFieldOrder<MatchmakerValue>,
		Player: WithFieldOrder<Player>,
		PlayerValue: WithFieldOrder<PlayerValue>,
		Position: WithFieldOrder<Position>,
	},
}
export const schema: SchemaType = {
	engine: {
		Board: {
			fieldOrder: ['match_id', 'x', 'o', 'empty', 'winner', 'active', 'ready'],
			match_id: 0,
			x: "",
			o: "",
			empty: [{ i: 0, j: 0, }],
			winner: "",
			active: false,
			ready: false,
		},
		BoardValue: {
			fieldOrder: ['x', 'o', 'empty', 'winner', 'active', 'ready'],
			x: "",
			o: "",
			empty: [{ i: 0, j: 0, }],
			winner: "",
			active: false,
			ready: false,
		},
		Matchmaker: {
			fieldOrder: ['server', 'last_board', 'last_board_ready'],
			server: 0,
			last_board: 0,
			last_board_ready: false,
		},
		MatchmakerValue: {
			fieldOrder: ['last_board', 'last_board_ready'],
			last_board: 0,
			last_board_ready: false,
		},
		Player: {
			fieldOrder: ['address', 'match_id', 'marks', 'turn'],
			address: "",
			match_id: 0,
			marks: [{ i: 0, j: 0, }],
			turn: false,
		},
		PlayerValue: {
			fieldOrder: ['match_id', 'marks', 'turn'],
			match_id: 0,
			marks: [{ i: 0, j: 0, }],
			turn: false,
		},
		Position: {
			fieldOrder: ['i', 'j'],
			i: 0,
			j: 0,
		},
	},
};
export enum ModelsMapping {
	Board = 'engine-Board',
	BoardValue = 'engine-BoardValue',
	Matchmaker = 'engine-Matchmaker',
	MatchmakerValue = 'engine-MatchmakerValue',
	Player = 'engine-Player',
	PlayerValue = 'engine-PlayerValue',
	Position = 'engine-Position',
}