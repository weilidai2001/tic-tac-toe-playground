# @tic-tac-toe/views

Shared UI components and utilities for the tic-tac-toe game implementations.

## What's Included

### Components
- `Board` - Game board component
- `Square` - Individual square component  
- `GameSetup` - Game configuration component
- `SymbolSelector` - Symbol selection component for wild mode

### Strategies
- `StandardStrategy` - Standard X vs O gameplay
- `WildStrategy` - Wild mode where players choose symbols
- `createGameStrategy(mode)` - Factory function for strategies

### Utilities
- `calculateWinner()` - Check for winning combinations
- `isBoardFull()` - Check if board is full
- `getEmptySquares()` - Get available moves
- `findWinningMove()` - Find winning move for AI
- `findBlockingMove()` - Find blocking move for AI

### Types
- `SquareValue` - 'X' | 'O' | null
- `GameMode` - 'standard' | 'wild'  
- `PlayerType` - 'human' | 'computer'
- `Player` - Player interface
- `GameStrategy` - Strategy interface

## Usage

```tsx
import { 
  Board, 
  GameSetup, 
  SquareValue, 
  createGameStrategy 
} from '@tic-tac-toe/views';
```

## Building

```bash
npm run build
```