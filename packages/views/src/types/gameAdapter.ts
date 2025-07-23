import { GameMode, PlayerType, SquareValue, ModeConfig } from './index';
import { getModeConfig } from '../config/modeConfigs';
import { createGameStrategy } from '../strategies';

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
  errorMessage?: string;
}

export interface GameActions {
  onModeChange: (mode: GameMode) => void;
  onPlayerTypeChange: (playerId: 'player1' | 'player2', type: PlayerType) => void;
  onStartGame: () => void;
  onSquareClick: (index: number, symbol?: SquareValue) => void;
  onResetGame: () => void;
  onResetToSetup: () => void;
  onClearError: () => void;
  onSetError: (message: string) => void;
}

export abstract class GameStateAdapter {
  gameState: GameState;
  actions: GameActions;
  selectedSymbol: SquareValue | null;
  setSelectedSymbol: (symbol: SquareValue | null) => void;
  
  constructor(
    gameState: GameState, 
    actions: GameActions, 
    selectedSymbol: SquareValue | null, 
    setSelectedSymbol: (symbol: SquareValue | null) => void
  ) {
    this.gameState = gameState;
    this.actions = actions;
    this.selectedSymbol = selectedSymbol;
    this.setSelectedSymbol = setSelectedSymbol;
  }

  // Shared implementations
  isGameDisabled(): boolean {
    return !!this.gameState.winner || 
           this.gameState.isAITurn || 
           this.gameState.currentPlayer.type === 'computer';
  }

  requiresSymbolSelection(): boolean {
    return this.gameState.mode === 'wild' && 
           this.gameState.currentPlayer.type === 'human' && 
           !this.gameState.isSetup && 
           !this.gameState.winner &&
           !this.gameState.isAITurn;
  }
  
  getModeConfig(): ModeConfig {
    return getModeConfig(this.gameState.mode);
  }
  
  getAvailableSymbols(): SquareValue[] {
    if (this.gameState.mode === 'standard') return [];
    const strategy = createGameStrategy(this.gameState.mode);
    return strategy.getAvailableSymbols(this.gameState.currentPlayer, this.gameState.mode);
  }
  
  getCurrentPlayerLabel(): string {
    const config = getModeConfig(this.gameState.mode);
    return config.getPlayerLabel(this.gameState.currentPlayer.id);
  }

  shouldShowSymbolSelector(): boolean {
    const availableSymbols = this.getAvailableSymbols();
    return this.requiresSymbolSelection() && 
           !this.gameState.isSetup && 
           this.gameState.currentPlayer.type === 'human' && 
           !this.gameState.winner &&
           !this.gameState.isAITurn &&
           availableSymbols.length > 1;
  }

  handleSquareClick = (index: number) => {
    if (this.requiresSymbolSelection() && this.gameState.currentPlayer.type === 'human') {
      if (!this.selectedSymbol) {
        this.actions.onSetError('Please select a symbol first!');
        return;
      }
      this.actions.onSquareClick(index, this.selectedSymbol);
      this.setSelectedSymbol(null);
    } else {
      this.actions.onSquareClick(index);
    }
  };

  hasError(): boolean {
    return !!this.gameState.errorMessage;
  }

  getErrorMessage(): string | undefined {
    return this.gameState.errorMessage;
  }
}