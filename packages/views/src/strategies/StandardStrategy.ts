import { GameStrategy, SquareValue, Player, GameMode } from '../types';
import { calculateWinner } from '../utils/gameLogic';

export class StandardStrategy implements GameStrategy {
  isMoveValid(board: SquareValue[], index: number): boolean {
    return board[index] === null;
  }

  checkWinner(board: SquareValue[]): SquareValue | null {
    return calculateWinner(board);
  }

  getAvailableSymbols(player: Player, mode: GameMode): SquareValue[] {
    if (mode !== 'standard') return [];
    return player.symbol ? [player.symbol] : [];
  }
}