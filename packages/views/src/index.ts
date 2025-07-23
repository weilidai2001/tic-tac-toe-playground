export { App } from './components/App';
export { Board } from './components/Board';
export { GameSetup } from './components/GameSetup';
export { Square } from './components/Square';
export { SymbolSelector } from './components/SymbolSelector';

export { createGameStrategy, StandardStrategy, WildStrategy } from './strategies';

export { modeConfigs, getModeConfig } from './config/modeConfigs';

export {
  calculateWinner,
  isBoardFull,
  getEmptySquares,
  findWinningMove,
  findBlockingMove,
  getAIMove,
  WINNING_LINES
} from './utils/gameLogic';

export type {
  SquareValue,
  GameMode,
  PlayerType,
  Player,
  GameStrategy,
  ModeConfig
} from './types';

export type { GameStateAdapter } from './types/gameAdapter';