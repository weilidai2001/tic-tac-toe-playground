import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setMode, setPlayerType, startGame, makeMove, resetGame, resetToSetup, makeAIMove } from '../store/gameSlice';
import { GameStateAdapter, SquareValue, GameMode, PlayerType } from '@tic-tac-toe/views';

export function useReduxAdapter(): GameStateAdapter {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.game);
  const [selectedSymbol, setSelectedSymbol] = useState<SquareValue | null>(null);

  // Handle AI moves
  useEffect(() => {
    if (gameState.currentPlayer.type === 'computer' && 
        !gameState.winner && 
        !gameState.isSetup) {
      const timer = setTimeout(() => {
        dispatch(makeAIMove());
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.winner, gameState.isSetup, dispatch]);

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
    onResetToSetup: () => dispatch(resetToSetup())
  };

  return {
    gameState,
    actions,
    selectedSymbol,
    setSelectedSymbol
  };
}