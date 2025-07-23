import { useState, useEffect, useCallback } from 'react';
import { TicTacToeFSM } from '../machines/gameMachine';
import { GameStateAdapter, SquareValue, GameMode, PlayerType } from '@tic-tac-toe/views';

class FSMAdapter extends GameStateAdapter {
  // No additional methods needed - all shared logic is in the base class
}

export function useXStateAdapter(): GameStateAdapter {
  const [fsm, setFsm] = useState(() => new TicTacToeFSM());
  const [selectedSymbol, setSelectedSymbol] = useState<SquareValue | null>(null);
  const [mode, setMode] = useState<GameMode>('standard');
  const [players, setPlayers] = useState({
    player1: { id: 'player1' as const, type: 'human' as PlayerType, symbol: 'X' as SquareValue },
    player2: { id: 'player2' as const, type: 'human' as PlayerType, symbol: 'O' as SquareValue }
  });
  const [isSetup, setIsSetup] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [, forceUpdate] = useState({});

  const triggerRerender = useCallback(() => {
    forceUpdate({});
  }, []);

  const state = fsm.getState();
  const board = fsm.getBoard();
  
  const currentPlayer = (state === 'X_TURN' || state === 'X_WIN' || (state === 'AI_THINKING' && fsm.isXTurn())) 
    ? players.player1 : players.player2;
  const winner: SquareValue | 'draw' | null = state === 'X_WIN' ? 'X' : state === 'O_WIN' ? 'O' : state === 'DRAW' ? 'draw' : null;
  const isAITurn = state === 'AI_THINKING' || (currentPlayer.type === 'computer' && (state === 'X_TURN' || state === 'O_TURN'));

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAITurn) {
        triggerRerender();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isAITurn, triggerRerender]);

  const gameState = {
    board,
    currentPlayer,
    winner,
    mode,
    players,
    isSetup,
    isAITurn,
    errorMessage
  };

  const actions = {
    onModeChange: (newMode: GameMode) => {
      setMode(newMode);
      if (newMode === 'wild') {
        setPlayers({
          player1: { ...players.player1, symbol: null },
          player2: { ...players.player2, symbol: null }
        });
      } else {
        setPlayers({
          player1: { ...players.player1, symbol: 'X' },
          player2: { ...players.player2, symbol: 'O' }
        });
      }
    },
    onPlayerTypeChange: (playerId: 'player1' | 'player2', playerType: PlayerType) => {
      setPlayers(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], type: playerType }
      }));
    },
    onStartGame: () => {
      const computerPlaysX = players.player1.type === 'computer';
      const computerPlaysO = players.player2.type === 'computer';
      const newFsm = new TicTacToeFSM({ computerPlaysX, computerPlaysO, mode });
      setFsm(newFsm);
      setIsSetup(false);
      triggerRerender();
    },
    onSquareClick: (index: number, symbol?: SquareValue) => {
      if (mode === 'wild' && symbol) {
        fsm.dispatch({ type: 'MOVE', index, symbol });
      } else {
        fsm.dispatch({ type: 'MOVE', index });
      }
      triggerRerender();
    },
    onResetGame: () => {
      fsm.dispatch({ type: 'RESET' });
      triggerRerender();
    },
    onResetToSetup: () => {
      setIsSetup(true);
      const newFsm = new TicTacToeFSM();
      setFsm(newFsm);
      triggerRerender();
    },
    onClearError: () => setErrorMessage(undefined),
    onSetError: (message: string) => setErrorMessage(message)
  };

  return new FSMAdapter(gameState, actions, selectedSymbol, setSelectedSymbol);
}