import { useState } from 'react';
import { TicTacToeFSM } from '../machines/gameMachine';
import { GameStateAdapter, SquareValue, GameMode, PlayerType } from '@tic-tac-toe/views';

class FSMAdapter extends GameStateAdapter {
  // No additional methods needed - all shared logic is in the base class
}

export function useXStateAdapter(): GameStateAdapter {
  const [fsm] = useState(() => new TicTacToeFSM());
  const [selectedSymbol, setSelectedSymbol] = useState<SquareValue | null>(null);
  const [gameState, setGameState] = useState(() => fsm.getGameState());

  // Set up callback for all state changes (including AI moves)
  fsm.setOnStateChange(() => setGameState(fsm.getGameState()));

  const actions = {
    onModeChange: (mode: GameMode) => {
      fsm.dispatch({ type: 'SET_MODE', mode });
    },
    onPlayerTypeChange: (playerId: 'player1' | 'player2', playerType: PlayerType) => {
      fsm.dispatch({ type: 'SET_PLAYER_TYPE', playerId, playerType });
    },
    onStartGame: () => {
      fsm.dispatch({ type: 'START_GAME' });
    },
    onSquareClick: (index: number, symbol?: SquareValue) => {
      if (symbol) {
        fsm.dispatch({ type: 'MOVE', index, symbol });
      } else {
        fsm.dispatch({ type: 'MOVE', index });
      }
    },
    onResetGame: () => {
      fsm.dispatch({ type: 'RESET' });
    },
    onResetToSetup: () => {
      fsm.dispatch({ type: 'RESET_TO_SETUP' });
    },
    onClearError: () => {
      fsm.dispatch({ type: 'CLEAR_ERROR' });
    },
    onSetError: (message: string) => {
      fsm.dispatch({ type: 'SET_ERROR', message });
    }
  };

  return new FSMAdapter(gameState, actions, selectedSymbol, setSelectedSymbol);
}