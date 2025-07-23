import { Board } from './Board';
import { GameSetup } from './GameSetup';
import { SymbolSelector } from './SymbolSelector';
import { GameStateAdapter } from '../types/gameAdapter';

interface AppProps {
  adapter: GameStateAdapter;
}

export function App({ adapter }: AppProps) {
  const { gameState, actions, selectedSymbol, setSelectedSymbol } = adapter;

  const handleSquareClick = (index: number) => {
    if (adapter.requiresSymbolSelection() && gameState.currentPlayer.type === 'human') {
      if (!selectedSymbol) {
        alert('Please select a symbol first!');
        return;
      }
      actions.onSquareClick(index, selectedSymbol);
      setSelectedSymbol(null);
    } else {
      actions.onSquareClick(index);
    }
  };

  const getGameStatus = () => {
    if (gameState.isSetup) return 'Set up your game';
    if (gameState.winner) {
      if (gameState.winner === 'draw') return "It's a draw!";
      return `Winner: ${gameState.winner}`;
    }
    if (gameState.isAITurn || gameState.currentPlayer.type === 'computer') {
      return 'AI is thinking...';
    }
    const playerLabel = adapter.getCurrentPlayerLabel();
    const playerType = gameState.currentPlayer.type === 'human' ? 'Human' : 'Computer';
    return `${playerLabel} (${playerType})'s turn`;
  };

  const availableSymbols = adapter.getAvailableSymbols();
  const showSymbolSelector = adapter.requiresSymbolSelection() && 
    !gameState.isSetup && 
    gameState.currentPlayer.type === 'human' && 
    !gameState.winner &&
    !gameState.isAITurn &&
    availableSymbols.length > 1;

  const isGameDisabled = !!gameState.winner || 
    gameState.isAITurn || 
    gameState.currentPlayer.type === 'computer';

  return (
    <div className="app">
      <header>
        <h1>Tic-Tac-Toe</h1>
        <div className="game-mode-indicator">
          Mode: {adapter.getModeConfig().displayName}
        </div>
      </header>

      <main>
        {gameState.isSetup && (
          <GameSetup
            modeConfig={adapter.getModeConfig()}
            player1Type={gameState.players.player1.type}
            player2Type={gameState.players.player2.type}
            onModeChange={actions.onModeChange}
            onPlayerTypeChange={actions.onPlayerTypeChange}
            onStartGame={actions.onStartGame}
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
                disabled={isGameDisabled}
              />
            )}

            <Board
              board={gameState.board}
              onSquareClick={handleSquareClick}
              disabled={isGameDisabled}
            />

            <div className="game-controls">
              {gameState.winner && (
                <button onClick={actions.onResetGame}>
                  Play Again
                </button>
              )}
              <button onClick={actions.onResetGame}>
                New Game
              </button>
              <button onClick={actions.onResetToSetup}>
                Change Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}