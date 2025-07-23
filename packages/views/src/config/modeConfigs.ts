import { ModeConfig, GameMode } from '../types';

export const modeConfigs: Record<GameMode, ModeConfig> = {
  standard: {
    id: 'standard',
    displayName: 'Standard',
    description: 'X vs O',
    getPlayerLabel: (playerId) => playerId === 'player1' ? 'Player 1 (X)' : 'Player 2 (O)'
  },
  wild: {
    id: 'wild',
    displayName: 'Wild',
    description: 'Choose X or O each turn',
    getPlayerLabel: (playerId) => playerId === 'player1' ? 'Player 1' : 'Player 2'
  }
};

export function getModeConfig(mode: GameMode): ModeConfig {
  return modeConfigs[mode];
}