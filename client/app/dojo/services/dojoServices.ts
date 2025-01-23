import { DojoProvider } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish } from "starknet";
import * as models from "../bindings/models.gen";
import { setupWorld } from "../bindings/contracts.gen";
import { useGameStore, Position } from "../../stores/state";

export class DojoService {
    private provider: DojoProvider;
    private account: Account | AccountInterface;
    private world: ReturnType<typeof setupWorld>;

    constructor(provider: DojoProvider, account: Account | AccountInterface) {
        this.provider = provider;
        this.account = account;
        this.world = setupWorld(provider);
    }
    
    private toDojoPosition(pos: Position): models.Position {
        return { 
            i: BigInt(pos.i) as BigNumberish, 
            j: BigInt(pos.j) as BigNumberish 
        };
    }

    async start() {
        try {
            const result = await this.world.actions.start(this.account);
            console.log("Match started:", result);
            return result;
        } catch (error) {
            console.error("Error starting match:", error);
            throw error;
        }
    }

    async startPrivate() {
        try {
            const result = await this.world.actions.startPrivate(this.account);
            console.log("Private match started:", result);
            return result;
        } catch (error) {
            console.error("Error starting private match:", error);
            throw error;
        }
    }

    async join(matchId: number) {
        try {
            const result = await this.world.actions.join(this.account, matchId);
            console.log("Joined match:", result);
            return result;
        } catch (error) {
            console.error("Error joining match:", error);
            throw error;
        }
    }

    async mark(position: Position) {
        try {
            const dojoPosition = this.toDojoPosition(position);
            const result = await this.world.actions.mark(this.account, dojoPosition);
            console.log("Marked position:", result);
            
            const [empty, x, o] = await this.readBoard();
            useGameStore.getState().updateBoardFromContract(empty, x, o);
            
            return result;
        } catch (error) {
            console.error("Error marking position:", error);
            throw error;
        }
    }

    async leave() {
        try {
            const result = await this.world.actions.leave(this.account);
            console.log("Left match:", result);
            return result;
        } catch (error) {
            console.error("Error leaving match:", error);
            throw error;
        }
    }

    async readBoard(): Promise<[models.Position[], models.Position[], models.Position[]]> {
        try {
            const result = await this.world.actions.readBoard();
            
            if (Array.isArray(result) && result.length === 3) {
                return result as [models.Position[], models.Position[], models.Position[]];
            }
            
            console.warn("Unexpected board data format:", result);
            return [[], [], []];
        } catch (error) {
            console.error("Error reading board:", error);
            return [[], [], []];
        }
    }
}