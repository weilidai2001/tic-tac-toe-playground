import { GameMode } from '../types';
import { StandardStrategy } from './StandardStrategy';
import { WildStrategy } from './WildStrategy';

export function createGameStrategy(mode: GameMode) {
  switch (mode) {
    case 'standard':
      return new StandardStrategy();
    case 'wild':
      return new WildStrategy();
    default:
      throw new Error(`Unknown game mode: ${mode}`);
  }
}

export { StandardStrategy, WildStrategy };