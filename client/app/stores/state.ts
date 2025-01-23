import { create } from 'zustand';
import { Position as DojoPosition } from '../dojo/bindings/models.gen';

type Position = {
    i: number,
    j: number
}

type Store = {
    address: string,
    matchId: number,
    me: boolean,
    emptySquares: Position[],
    xSquares: Position[],
    oSquares: Position[],
    setAddress: (address: string) => void,
    setMatchId: (matchId: number) => void,
    setMe: (me: boolean) => void,
    markX: (pos: Position) => void,
    markO: (pos: Position) => void,
    updateBoardFromContract: (empty: DojoPosition[], x: DojoPosition[], o: DojoPosition[]) => void,
    resetBoard: () => void,
}

export const useGameStore = create<Store>()((set) => ({
    address: '',
    matchId: 0,
    me: true,
    emptySquares: [
        {i: 1, j: 1},
        {i: 1, j: 2},
        {i: 1, j: 3},
        {i: 2, j: 1},
        {i: 2, j: 2},
        {i: 2, j: 3},
        {i: 3, j: 1},
        {i: 3, j: 2},
        {i: 3, j: 3},
    ],
    xSquares: [],
    oSquares: [],
    setAddress: (address: string) => set({address}),
    setMatchId: (matchId: number) => set({matchId}),
    setMe: (me: boolean) => set({me}),
    markX: (pos: Position) => {
        set((state) => ({
            emptySquares: state.emptySquares.filter(
                (square) => square.i !== pos.i || square.j !== pos.j
            ),
            xSquares: [...state.xSquares, pos],
        }));
    },
    markO: (pos: Position) => {
        set((state) => ({
            emptySquares: state.emptySquares.filter(
                (square) => square.i !== pos.i || square.j !== pos.j
            ),
            oSquares: [...state.oSquares, pos],
        }));
    },
    updateBoardFromContract: (empty, x, o) => set({
        emptySquares: empty.map(pos => ({ i: Number(pos.i), j: Number(pos.j) })),
        xSquares: x.map(pos => ({ i: Number(pos.i), j: Number(pos.j) })),
        oSquares: o.map(pos => ({ i: Number(pos.i), j: Number(pos.j) })),
    }),
    resetBoard: () => set({
        emptySquares: [
            {i: 1, j: 1}, {i: 1, j: 2}, {i: 1, j: 3},
            {i: 2, j: 1}, {i: 2, j: 2}, {i: 2, j: 3},
            {i: 3, j: 1}, {i: 3, j: 2}, {i: 3, j: 3},
        ],
        xSquares: [],
        oSquares: [],
    }),
}))

export type { Position };