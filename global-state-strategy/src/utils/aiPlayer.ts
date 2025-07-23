import { SquareValue, GameMode } from '../types';
import { getAIMove as sharedGetAIMove } from '@tic-tac-toe/views';

export function getAIMove(board: SquareValue[], mode: GameMode): { index: number; symbol?: SquareValue } {
  // Use the shared AI logic from the views package
  // In standard mode, AI typically plays as 'O'
  const aiSymbol: SquareValue | undefined = mode === 'standard' ? 'O' : undefined;
  return sharedGetAIMove(board, mode, aiSymbol);
}