/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DojoProvider } from "@dojoengine/core";
import { 
	Account, 
	AccountInterface, 
	BigNumberish, 
	// CairoOption, 
	// CairoCustomEnum, 
	// ByteArray 
} from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const play_mark = async (snAccount: Account | AccountInterface, position: models.Position) => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return await provider.execute(
				snAccount as any,
				{
					contractName: "play",
					entrypoint: "mark",
					calldata: [position],
				},
				"engine",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const read_board_readBoard = async () => {
		try {
			return await provider.call("engine", {
				contractName: "read_board",
				entrypoint: "read_board",
				calldata: [],
			});
		} catch (error) {
			console.error(error);
		}
	};

	const start_start = async (snAccount: Account | AccountInterface) => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return await provider.execute(
				snAccount as any,
				{
					contractName: "start",
					entrypoint: "start",
					calldata: [],
				},
				"engine",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const start_startPrivate = async (snAccount: Account | AccountInterface) => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return await provider.execute(
				snAccount as any,
				{
					contractName: "start",
					entrypoint: "start_private",
					calldata: [],
				},
				"engine",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const start_join = async (snAccount: Account | AccountInterface, matchId: BigNumberish) => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return await provider.execute(
				snAccount as any,
				{
					contractName: "start",
					entrypoint: "join",
					calldata: [matchId],
				},
				"engine",
			);
		} catch (error) {
			console.error(error);
		}
	};

	const leave_leave = async (snAccount: Account | AccountInterface) => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return await provider.execute(
				snAccount as any,
				{
					contractName: "leave",
					entrypoint: "leave",
					calldata: [],
				},
				"engine",
			);
		} catch (error) {
			console.error(error);
		}
	};

	return {
		play: {
			mark: play_mark,
		},
		read_board: {
			readBoard: read_board_readBoard,
		},
		start: {
			start: start_start,
			startPrivate: start_startPrivate,
			join: start_join,
		},
		leave: {
			leave: leave_leave,
		},
	};
}
