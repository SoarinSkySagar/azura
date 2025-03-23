/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */



import { DojoProvider, DojoCall } from "@dojoengine/core";
import {
  Account,
  AccountInterface,
  BigNumberish,
  CairoOption,
  CairoCustomEnum,
  ByteArray,
} from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {
  const build_start_join_calldata = (matchId: BigNumberish): DojoCall => {
    return {
      contractName: "start",
      entrypoint: "join",
      calldata: [matchId],
    };
  };

  const start_join = async (
    snAccount: Account | AccountInterface,
    matchId: BigNumberish
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await provider.execute(
        snAccount as any,
        build_start_join_calldata(matchId),
        "engine"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_leave_leave_calldata = (): DojoCall => {
    return {
      contractName: "leave",
      entrypoint: "leave",
      calldata: [],
    };
  };

  const leave_leave = async (snAccount: Account | AccountInterface) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await provider.execute(
        snAccount as any,
        build_leave_leave_calldata(),
        "engine"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_play_mark_calldata = (
    position: models.Position
  ): DojoCall => {
    return {
      contractName: "play",
      entrypoint: "mark",
      calldata: [position],
    };
  };

  const play_mark = async (
    snAccount: Account | AccountInterface,
    position: models.Position
  ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await provider.execute(
        snAccount as any,
        build_play_mark_calldata(position),
        "engine"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_read_board_readBoard_calldata = (): DojoCall => {
    return {
      contractName: "read_board",
      entrypoint: "read_board",
      calldata: [],
    };
  };

  const read_board_readBoard = async () => {
    try {
      return await provider.call("engine", build_read_board_readBoard_calldata());
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_start_start_calldata = (): DojoCall => {
    return {
      contractName: "start",
      entrypoint: "start",
      calldata: [],
    };
  };

  const start_start = async (snAccount: Account | AccountInterface) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await provider.execute(
        snAccount as any,
        build_start_start_calldata(),
        "engine"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_start_startPrivate_calldata = (): DojoCall => {
    return {
      contractName: "start",
      entrypoint: "start_private",
      calldata: [],
    };
  };

  const start_startPrivate = async (snAccount: Account | AccountInterface) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await provider.execute(
        snAccount as any,
        build_start_startPrivate_calldata(),
        "engine"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    start: {
      join: start_join,
      buildJoinCalldata: build_start_join_calldata,
      start: start_start,
      buildStartCalldata: build_start_start_calldata,
      startPrivate: start_startPrivate,
      buildStartPrivateCalldata: build_start_startPrivate_calldata,
    },
    leave: {
      leave: leave_leave,
      buildLeaveCalldata: build_leave_leave_calldata,
    },
    play: {
      mark: play_mark,
      buildMarkCalldata: build_play_mark_calldata,
    },
    read_board: {
      readBoard: read_board_readBoard,
      buildReadBoardCalldata: build_read_board_readBoard_calldata,
    },
  };
}
