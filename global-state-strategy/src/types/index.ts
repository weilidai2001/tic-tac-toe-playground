export type SquareValue = 'X' | 'O' | null;

export type GameMode = 'standard' | 'wild';

export type PlayerType = 'human' | 'computer';

export interface Player {
  id: 'player1' | 'player2';
  type: PlayerType;
  symbol?: SquareValue; // Only used in standard mode
}

export interface GameState {
  board: SquareValue[];
  currentPlayer: Player;
  winner: SquareValue | 'draw' | null;
  mode: GameMode;
  players: {
    player1: Player;
    player2: Player;
  };
  isSetup: boolean;
}

export interface GameStrategy {
  isMoveValid(board: SquareValue[], index: number): boolean;
  checkWinner(board: SquareValue[]): SquareValue | null;
  getAvailableSymbols(player: Player, mode: GameMode): SquareValue[];
}