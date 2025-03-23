import GameResult from '@/app/models/GameResult';
import connectDB from '@/app/utils/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const gameResults = await GameResult.find({})
        .sort({ createdAt: -1 })
        .limit(10);
      res.status(200).json(gameResults);
    } catch (error) {
      console.error('Error fetching game results:', error);
      res.status(500).json({ error: 'Failed to fetch game results' });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;

      // Validate required fields
      const requiredFields = ['player1', 'player2', 'moves', 'startTime', 'endTime', 'status'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      // Calculate duration
      const startTime = new Date(body.startTime);
      const endTime = new Date(body.endTime);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Create new game result
      const gameResult = await GameResult.create({
        ...body,
        duration,
      });

      res.status(201).json({ message: 'Game result saved successfully', data: gameResult });
    } catch (error: unknown) {
      console.error('Error saving game result:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: 'Failed to save game result', details: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 