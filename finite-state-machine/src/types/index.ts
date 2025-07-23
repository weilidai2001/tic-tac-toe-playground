import { SquareValue, GameMode, Player, PlayerType } from '@tic-tac-toe/views';

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
}

export type GameEvent = 
  | { type: 'PLAY'; index: number; symbol?: SquareValue }
  | { type: 'RESET' }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_PLAYER_TYPE'; playerId: 'player1' | 'player2'; playerType: PlayerType }
  | { type: 'AI_MOVE' };