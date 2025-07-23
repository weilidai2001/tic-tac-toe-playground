import { SquareValue, GameMode, Player } from '@tic-tac-toe/views';

export type { SquareValue, GameMode, PlayerType, Player, GameStrategy } from '@tic-tac-toe/views';

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
  isAITurn?: boolean;
}