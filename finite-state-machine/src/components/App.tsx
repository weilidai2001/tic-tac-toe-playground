import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';
import { Board } from './Board';
import { GameSetup } from './GameSetup';
import { SymbolSelector } from './SymbolSelector';
import { SquareValue } from '../types';
import { createGameStrategy } from '../strategies';

export function App() {
  const [state, send] = useMachine(gameMachine);
  const [selectedSymbol, setSelectedSymbol] = useState<SquareValue | null>(null);

  const context = state.context;
  const isSetup = state.matches('setup');
  const isPlaying = state.matches('playing');
  const isAITurn = state.matches('aiTurn');
  const isGameOver = state.matches('gameOver');

  const handleSquareClick = (index: number) => {
    if (context.mode === 'wild' && context.currentPlayer.type === 'human') {
      if (!selectedSymbol) {
        alert('Please select a symbol first!');
        return;
      }
      send({ type: 'PLAY', index, symbol: selectedSymbol });
      setSelectedSymbol(null); // Reset selection after move
    } else {
      send({ type: 'PLAY', index });
    }
  };

  const getGameStatus = () => {
    if (isSetup) return 'Set up your game';
    if (isGameOver) {
      if (context.winner === 'draw') return "It's a draw!";
      if (context.winner) return `Winner: ${context.winner}`;
    }
    if (isAITurn) return 'AI is thinking...';
    if (isPlaying) {
      const playerName = context.currentPlayer.id === 'player1' ? 'Player 1' : 'Player 2';
      const playerType = context.currentPlayer.type === 'human' ? 'Human' : 'Computer';
      return `${playerName} (${playerType})'s turn`;
    }
    return '';
  };

  const getAvailableSymbols = (): SquareValue[] => {
    if (context.mode === 'standard') return [];
    const strategy = createGameStrategy(context.mode);
    return strategy.getAvailableSymbols(context.currentPlayer, context.mode);
  };

  const availableSymbols = getAvailableSymbols();
  const showSymbolSelector = context.mode === 'wild' && 
    isPlaying && 
    context.currentPlayer.type === 'human' && 
    availableSymbols.length > 1;

  return (
    <div className="app">
      <header>
        <h1>Tic-Tac-Toe</h1>
        <div className="game-mode-indicator">
          Mode: {context.mode === 'standard' ? 'Standard' : 'Wild'}
        </div>
      </header>

      <main>
        {isSetup && (
          <GameSetup
            mode={context.mode}
            player1Type={context.players.player1.type}
            player2Type={context.players.player2.type}
            onModeChange={(mode) => send({ type: 'SET_MODE', mode })}
            onPlayerTypeChange={(playerId, playerType) => 
              send({ type: 'SET_PLAYER_TYPE', playerId, playerType })
            }
            onStartGame={() => send({ type: 'PLAY', index: 0 })}
          />
        )}

        {!isSetup && (
          <div className="game-area">
            <div className="game-status">{getGameStatus()}</div>
            
            {showSymbolSelector && (
              <SymbolSelector
                availableSymbols={availableSymbols}
                selectedSymbol={selectedSymbol}
                onSymbolSelect={setSelectedSymbol}
                disabled={isAITurn || isGameOver}
              />
            )}

            <Board
              board={context.board}
              onSquareClick={handleSquareClick}
              disabled={isAITurn || isGameOver || context.currentPlayer.type === 'computer'}
            />

            <div className="game-controls">
              {isGameOver && (
                <button onClick={() => send({ type: 'RESET' })}>
                  Play Again
                </button>
              )}
              <button onClick={() => send({ type: 'RESET' })}>
                New Game
              </button>
              <button onClick={() => {
                send({ type: 'RESET' });
                // Reset to setup by transitioning through states
                setTimeout(() => {
                  // This is a bit of a hack - in a real app you'd want a proper "SETUP" event
                  window.location.reload();
                }, 100);
              }}>
                Change Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}