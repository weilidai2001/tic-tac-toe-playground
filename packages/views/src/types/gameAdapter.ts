import { GameMode, PlayerType, SquareValue } from './index';

export interface GameState {
  board: SquareValue[];
  currentPlayer: {
    id: 'player1' | 'player2';
    type: PlayerType;
    symbol?: SquareValue;
  };
  winner: SquareValue | 'draw' | null;
  mode: GameMode;
  players: {
    player1: { id: 'player1' | 'player2'; type: PlayerType; symbol?: SquareValue };
    player2: { id: 'player1' | 'player2'; type: PlayerType; symbol?: SquareValue };
  };
  isSetup: boolean;
  isAITurn?: boolean;
}

export interface GameActions {
  onModeChange: (mode: GameMode) => void;
  onPlayerTypeChange: (playerId: 'player1' | 'player2', type: PlayerType) => void;
  onStartGame: () => void;
  onSquareClick: (index: number, symbol?: SquareValue) => void;
  onResetGame: () => void;
  onResetToSetup: () => void;
}

export interface GameStateAdapter {
  gameState: GameState;
  actions: GameActions;
  selectedSymbol: SquareValue | null;
  setSelectedSymbol: (symbol: SquareValue | null) => void;
}