import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../utils/db';
import GameResult from '../models/GameResult';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const gameResults = await GameResult.find({});
      res.status(200).json(gameResults);
    } catch (error) {
      console.error('Error fetching game results:', error);
      res.status(500).json({ error: 'Failed to fetch game results' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
