import { GameState } from '../types/gameAdapter';
import { getModeConfig } from '../config/modeConfigs';

interface GameStatusProps {
  gameState: GameState;
}

export function GameStatus({ gameState }: GameStatusProps) {
  const getGameStatus = () => {
    if (gameState.isSetup) return 'Set up your game';
    if (gameState.winner) {
      if (gameState.winner === 'draw') return "It's a draw!";
      return `Winner: ${gameState.winner}`;
    }
    if (gameState.isAITurn || gameState.currentPlayer.type === 'computer') {
      return 'AI is thinking...';
    }
    const config = getModeConfig(gameState.mode);
    const playerLabel = config.getPlayerLabel(gameState.currentPlayer.id);
    const playerType = gameState.currentPlayer.type === 'human' ? 'Human' : 'Computer';
    return `${playerLabel} (${playerType})'s turn`;
  };

  return <div className="game-status">{getGameStatus()}</div>;
}