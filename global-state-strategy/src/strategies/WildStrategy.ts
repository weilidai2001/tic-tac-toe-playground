import { GameStrategy, SquareValue, Player, GameMode } from '../types';
import { calculateWinner } from '../utils/gameLogic';

export class WildStrategy implements GameStrategy {
  isMoveValid(board: SquareValue[], index: number): boolean {
    return board[index] === null;
  }

  checkWinner(board: SquareValue[]): SquareValue | null {
    return calculateWinner(board);
  }

  getAvailableSymbols(_player: Player, mode: GameMode): SquareValue[] {
    if (mode !== 'wild') return [];
    return ['X', 'O'];
  }
}