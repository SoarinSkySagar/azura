import mongoose, { Schema, Document } from 'mongoose';

export interface IGameResult extends Document {
  player1: {
    address: string;
    symbol: 'X' | 'O';
  };
  player2: {
    address: string;
    symbol: 'X' | 'O';
  };
  winner: string | null; // Address of winner, null for draw
  moves: {
    position: number;
    player: string;
    symbol: 'X' | 'O';
  }[];
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  status: 'completed' | 'draw';
  createdAt: Date;
  updatedAt: Date;
}

const GameResultSchema: Schema = new Schema({
  player1: {
    address: { type: String, required: true },
    symbol: { type: String, enum: ['X', 'O'], required: true }
  },
  player2: {
    address: { type: String, required: true },
    symbol: { type: String, enum: ['X', 'O'], required: true }
  },
  winner: { type: String, default: null },
  moves: [{
    position: { type: Number, required: true },
    player: { type: String, required: true },
    symbol: { type: String, enum: ['X', 'O'], required: true }
  }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'draw'], required: true },
}, {
  timestamps: true
});

// Create the model if it doesn't exist, otherwise use the existing one
export const GameResult = mongoose.models.GameResult || mongoose.model<IGameResult>('GameResult', GameResultSchema);

export default GameResult; 