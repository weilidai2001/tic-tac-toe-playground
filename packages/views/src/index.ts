export { Board } from './components/Board';
export { GameSetup } from './components/GameSetup';
export { Square } from './components/Square';
export { SymbolSelector } from './components/SymbolSelector';

export { createGameStrategy, StandardStrategy, WildStrategy } from './strategies';

export {
  calculateWinner,
  isBoardFull,
  getEmptySquares,
  findWinningMove,
  findBlockingMove,
  WINNING_LINES
} from './utils/gameLogic';

export type {
  SquareValue,
  GameMode,
  PlayerType,
  Player,
  GameStrategy
} from './types';