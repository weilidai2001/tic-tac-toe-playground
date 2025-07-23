import { GameStateAdapter } from '../types/gameAdapter';

interface GameStatusProps {
  adapter: GameStateAdapter;
}

export function GameStatus({ adapter }: GameStatusProps) {
  const { gameState } = adapter;

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

  return <div className="game-status">{getGameStatus()}</div>;
}