import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setMode, setPlayerType, startGame, makeMove, resetGame, resetToSetup, makeAIMove } from '../store/gameSlice';
import { Board } from './Board';
import { GameSetup } from './GameSetup';
import { SymbolSelector } from './SymbolSelector';
import { SquareValue } from '../types';
import { createGameStrategy } from '../strategies';

export function App() {
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
      }, 1000); // 1 second delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.winner, gameState.isSetup, dispatch]);

  const handleSquareClick = (index: number) => {
    if (gameState.mode === 'wild' && gameState.currentPlayer.type === 'human') {
      if (!selectedSymbol) {
        alert('Please select a symbol first!');
        return;
      }
      dispatch(makeMove({ index, symbol: selectedSymbol }));
      setSelectedSymbol(null);
    } else {
      dispatch(makeMove({ index }));
    }
  };

  const getGameStatus = () => {
    if (gameState.isSetup) return 'Set up your game';
    if (gameState.winner) {
      if (gameState.winner === 'draw') return "It's a draw!";
      return `Winner: ${gameState.winner}`;
    }
    if (gameState.currentPlayer.type === 'computer') {
      return 'AI is thinking...';
    }
    const playerName = gameState.currentPlayer.id === 'player1' ? 'Player 1' : 'Player 2';
    const playerType = gameState.currentPlayer.type === 'human' ? 'Human' : 'Computer';
    return `${playerName} (${playerType})'s turn`;
  };

  const getAvailableSymbols = (): SquareValue[] => {
    if (gameState.mode === 'standard') return [];
    const strategy = createGameStrategy(gameState.mode);
    return strategy.getAvailableSymbols(gameState.currentPlayer, gameState.mode);
  };

  const availableSymbols = getAvailableSymbols();
  const showSymbolSelector = gameState.mode === 'wild' && 
    !gameState.isSetup && 
    gameState.currentPlayer.type === 'human' && 
    !gameState.winner &&
    availableSymbols.length > 1;

  return (
    <div className="app">
      <header>
        <h1>Tic-Tac-Toe</h1>
        <div className="game-mode-indicator">
          Mode: {gameState.mode === 'standard' ? 'Standard' : 'Wild'}
        </div>
      </header>

      <main>
        {gameState.isSetup && (
          <GameSetup
            mode={gameState.mode}
            player1Type={gameState.players.player1.type}
            player2Type={gameState.players.player2.type}
            onModeChange={(mode) => dispatch(setMode(mode))}
            onPlayerTypeChange={(playerId, playerType) => 
              dispatch(setPlayerType({ playerId, playerType }))
            }
            onStartGame={() => dispatch(startGame())}
          />
        )}

        {!gameState.isSetup && (
          <div className="game-area">
            <div className="game-status">{getGameStatus()}</div>
            
            {showSymbolSelector && (
              <SymbolSelector
                availableSymbols={availableSymbols}
                selectedSymbol={selectedSymbol}
                onSymbolSelect={setSelectedSymbol}
                disabled={!!gameState.winner || gameState.currentPlayer.type === 'computer'}
              />
            )}

            <Board
              board={gameState.board}
              onSquareClick={handleSquareClick}
              disabled={!!gameState.winner || gameState.currentPlayer.type === 'computer'}
            />

            <div className="game-controls">
              {gameState.winner && (
                <button onClick={() => dispatch(resetGame())}>
                  Play Again
                </button>
              )}
              <button onClick={() => dispatch(resetGame())}>
                New Game
              </button>
              <button onClick={() => dispatch(resetToSetup())}>
                Change Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}