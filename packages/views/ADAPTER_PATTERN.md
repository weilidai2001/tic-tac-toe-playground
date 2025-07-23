# Generic App Component with Adapter Pattern

The `App` component has been made completely generic using the Adapter Pattern, allowing it to work with any state management solution while sharing the same UI logic.

## Architecture

```
┌─────────────────────────────────────┐
│          Generic App                │
│    (@tic-tac-toe/views)            │
│                                     │
│  - UI Logic                         │
│  - Game Status Display              │
│  - Symbol Selection Logic           │
│  - Button Actions                   │
└─────────────────────────────────────┘
                  │
                  │ GameStateAdapter
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐ ┌────────▼─────────┐
│  XState        │ │   Redux          │
│  Adapter       │ │   Adapter        │
│                │ │                  │
│ - useMachine   │ │ - useSelector    │
│ - send()       │ │ - useDispatch    │
│ - state mgmt   │ │ - actions        │
└────────────────┘ └──────────────────┘
```

## GameStateAdapter Interface

```typescript
interface GameStateAdapter {
  gameState: GameState;        // Current game state
  actions: GameActions;        // Action handlers
  selectedSymbol: SquareValue | null;  // Wild mode symbol selection
  setSelectedSymbol: (symbol: SquareValue | null) => void;
}
```

## Usage

### XState Version
```typescript
import { App as GenericApp } from '@tic-tac-toe/views';
import { useXStateAdapter } from '../adapters/xstateAdapter';

export function App() {
  const adapter = useXStateAdapter();
  return <GenericApp adapter={adapter} />;
}
```

### Redux Version  
```typescript
import { App as GenericApp } from '@tic-tac-toe/views';
import { useReduxAdapter } from '../adapters/reduxAdapter';

export function App() {
  const adapter = useReduxAdapter();
  return <GenericApp adapter={adapter} />;
}
```

## Benefits

1. **Single Source of Truth for UI Logic** - All game UI behavior is centralized
2. **Architecture Agnostic** - Works with any state management solution
3. **Easy Testing** - Can mock the adapter for unit tests
4. **Consistent Behavior** - Same UI logic across all implementations
5. **Easy Extension** - Add new state management approaches by creating new adapters

## Adding New State Management

To add a new state management solution:

1. Create an adapter that implements `GameStateAdapter`
2. Handle state subscription and action dispatching
3. Map your state shape to the common `GameState` interface
4. Import and use the generic `App` component

Example for MobX:
```typescript
export function useMobXAdapter(): GameStateAdapter {
  const store = useStore();
  
  return {
    gameState: {
      board: store.board,
      currentPlayer: store.currentPlayer,
      // ... map your store to GameState
    },
    actions: {
      onModeChange: (mode) => store.setMode(mode),
      // ... map your actions
    },
    selectedSymbol: store.selectedSymbol,
    setSelectedSymbol: (symbol) => store.setSelectedSymbol(symbol)
  };
}
```