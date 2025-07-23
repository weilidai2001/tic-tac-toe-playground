import { Board } from './Board';
import { SymbolSelector } from './SymbolSelector';
import { GameStatus } from './GameStatus';
import { GameStateAdapter } from '../types/gameAdapter';

interface GamePlayProps {
  adapter: GameStateAdapter;
}

export function GamePlay({ adapter }: GamePlayProps) {
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
    <div className="game-area">
      <GameStatus adapter={adapter} />
      
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
  );
}