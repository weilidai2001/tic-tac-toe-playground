export type SquareValue = 'X' | 'O' | null;

export type GameMode = 'standard' | 'wild';

export type PlayerType = 'human' | 'computer';

export interface Player {
  id: 'player1' | 'player2';
  type: PlayerType;
  symbol?: SquareValue; // Only used in standard mode
}

export interface ModeConfig {
  id: GameMode;
  displayName: string;
  description: string;
  getPlayerLabel: (playerId: 'player1' | 'player2') => string;
}

export interface GameStrategy {
  isMoveValid(board: SquareValue[], index: number): boolean;
  checkWinner(board: SquareValue[]): SquareValue | null;
  getAvailableSymbols(player: Player, mode: GameMode): SquareValue[];
}

// Re-export from gameAdapter.ts
export type { GameState, GameActions } from './gameAdapter';