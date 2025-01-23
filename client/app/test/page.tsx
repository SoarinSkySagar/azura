'use client';

import { useState, useEffect } from 'react';
import { Account, RpcProvider, ec, stark } from 'starknet';
import { DojoProvider } from "@dojoengine/core";
import { DojoService } from '../dojo/services/dojoServices';
import { useGameStore, Position } from '../stores/state';

export default function PlayPage() {
    const [account, setAccount] = useState<Account | null>(null);
    const [dojoService, setDojoService] = useState<DojoService | null>(null);
    const gameStore = useGameStore();

    useEffect(() => {
        setupStarknet();
    }, []);

    const setupStarknet = async () => {
        try {
            // RPC Provider
            const rpcProvider = new RpcProvider({
                nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-goerli.public.blastapi.io/rpc/v0_6'
            });

            // generate random private key
            const privateKey = stark.randomAddress();
            
            // derive public key
            const publicKey = ec.starkCurve.getStarkKey(privateKey);
            
            // create account
            const account = new Account(
                rpcProvider, 
                publicKey, 
                privateKey
            );
            setAccount(account);

            // setup dojo provider
            const dojoProvider = new DojoProvider(
                {
                    rpcUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-goerli.public.blastapi.io/rpc/v0_6',
                    toriiUrl: process.env.NEXT_PUBLIC_TORII_URL || '',
                    worldAddress: process.env.NEXT_PUBLIC_WORLD_ADDRESS || ''
                }
            );

            // create dojo service
            const service = new DojoService(dojoProvider, account);
            setDojoService(service);

            // update store with account address
            gameStore.setAddress(account.address);
        } catch (error) {
            console.error('Starknet setup error:', error);
        }
    };

    const handleStart = async () => {
        if (!dojoService) {
            alert('Please wait for account setup');
            return;
        }
        await dojoService.start();
    };

    const handleJoin = async () => {
        if (!dojoService) {
            alert('Please wait for account setup');
            return;
        }
        // hardcoded match ID for testing
        await dojoService.join(1);
    };

    const handleMark = async () => {
        if (!dojoService) {
            alert('Please wait for account setup');
            return;
        }
        
        // use local Position type
        const position: Position = { i: 1, j: 1 };
        await dojoService.mark(position);
    };

    const handleReadBoard = async () => {
        if (!dojoService) {
            alert('Please wait for account setup');
            return;
        }
        
        const [empty, x, o] = await dojoService.readBoard();
        console.log('Board state:', { empty, x, o });
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Tic Tac Toe - Dojo Test</h1>

            <div className="space-y-4">
                <div>
                    <p>Account: {account?.address || 'Not Connected'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleStart} 
                        className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={!dojoService}
                    >
                        Start Match
                    </button>

                    <button 
                        onClick={handleJoin} 
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={!dojoService}
                    >
                        Join Match
                    </button>

                    <button 
                        onClick={handleMark} 
                        className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={!dojoService}
                    >
                        Mark Position (1,1)
                    </button>

                    <button 
                        onClick={handleReadBoard} 
                        className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        disabled={!dojoService}
                    >
                        Read Board
                    </button>
                </div>

                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h2 className="font-bold mb-2">Current Board State:</h2>
                    <pre className="text-sm">
                        {JSON.stringify({
                            emptySquares: gameStore.emptySquares,
                            xSquares: gameStore.xSquares,
                            oSquares: gameStore.oSquares
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}