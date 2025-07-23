import { useState } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';
import { GameStateAdapter, SquareValue, GameMode, PlayerType } from '@tic-tac-toe/views';

class XStateAdapter extends GameStateAdapter {
  // No additional methods needed - all shared logic is in the base class
}

export function useXStateAdapter(): GameStateAdapter {
  const [state, send] = useMachine(gameMachine);
  const [selectedSymbol, setSelectedSymbol] = useState<SquareValue | null>(null);

  const context = state.context;
  const isSetup = state.matches('setup');
  const isAITurn = state.matches('aiTurn');

  const gameState = {
    board: context.board,
    currentPlayer: context.currentPlayer,
    winner: context.winner,
    mode: context.mode,
    players: context.players,
    isSetup,
    isAITurn,
    errorMessage: context.errorMessage
  };

  const actions = {
    onModeChange: (mode: GameMode) => send({ type: 'SET_MODE', mode }),
    onPlayerTypeChange: (playerId: 'player1' | 'player2', playerType: PlayerType) => 
      send({ type: 'SET_PLAYER_TYPE', playerId, playerType }),
    onStartGame: () => send({ type: 'PLAY', index: 0 }),
    onSquareClick: (index: number, symbol?: SquareValue) => {
      if (symbol) {
        send({ type: 'PLAY', index, symbol });
      } else {
        send({ type: 'PLAY', index });
      }
    },
    onResetGame: () => send({ type: 'RESET' }),
    onResetToSetup: () => {
      send({ type: 'RESET' });
      // This is a bit of a hack for the setup transition
      setTimeout(() => {
        window.location.reload();
      }, 100);
    },
    onClearError: () => send({ type: 'CLEAR_ERROR' }),
    onSetError: (message: string) => send({ type: 'SET_ERROR', message })
  };

  return new XStateAdapter(gameState, actions, selectedSymbol, setSelectedSymbol);
}