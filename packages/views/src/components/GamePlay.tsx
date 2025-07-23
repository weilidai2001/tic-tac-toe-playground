import { Board } from './Board';
import { SymbolSelector } from './SymbolSelector';
import { GameStatus } from './GameStatus';
import { GameStateAdapter } from '../types/gameAdapter';

interface GamePlayProps {
  adapter: GameStateAdapter;
}

export function GamePlay({ adapter }: GamePlayProps) {
  const { gameState, actions, selectedSymbol, setSelectedSymbol } = adapter;

  const availableSymbols = adapter.getAvailableSymbols();
  const showSymbolSelector = adapter.shouldShowSymbolSelector();
  const isGameDisabled = adapter.isGameDisabled();
  const hasError = adapter.hasError();
  const errorMessage = adapter.getErrorMessage();

  return (
    <div className="game-area">
      <GameStatus gameState={gameState} />
      
      {hasError && (
        <div className="error-message">
          <span>{errorMessage}</span>
          <button onClick={actions.onClearError}>✕</button>
        </div>
      )}
      
      {showSymbolSelector && (
        <SymbolSelector
          availableSymbols={availableSymbols}
          selectedSymbol={selectedSymbol}
          onSymbolSelect={setSelectedSymbol}
          disabled={isGameDisabled || hasError}
        />
      )}

      <Board
        board={gameState.board}
        onSquareClick={adapter.handleSquareClick}
        disabled={isGameDisabled || hasError}
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
  );
}