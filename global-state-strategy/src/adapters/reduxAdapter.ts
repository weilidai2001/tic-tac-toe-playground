import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setMode, setPlayerType, startGame, makeMove, resetGame, resetToSetup, setError, clearError } from '../store/gameSlice';
import { GameStateAdapter, SquareValue, GameMode, PlayerType } from '@tic-tac-toe/views';

class ReduxAdapter extends GameStateAdapter {
  // No additional methods needed - all shared logic is in the base class
}

export function useReduxAdapter(): GameStateAdapter {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.game);
  const [selectedSymbol, setSelectedSymbol] = useState<SquareValue | null>(null);

  const actions = {
    onModeChange: (mode: GameMode) => dispatch(setMode(mode)),
    onPlayerTypeChange: (playerId: 'player1' | 'player2', playerType: PlayerType) => 
      dispatch(setPlayerType({ playerId, playerType })),
    onStartGame: () => dispatch(startGame()),
    onSquareClick: (index: number, symbol?: SquareValue) => {
      if (symbol) {
        dispatch(makeMove({ index, symbol }));
      } else {
        dispatch(makeMove({ index }));
      }
    },
    onResetGame: () => dispatch(resetGame()),
    onResetToSetup: () => dispatch(resetToSetup()),
    onClearError: () => dispatch(clearError()),
    onSetError: (message: string) => dispatch(setError(message))
  };

  return new ReduxAdapter(gameState, actions, selectedSymbol, setSelectedSymbol);
}