# FSM vs Redux: Architecture Analysis for Board Games

## Executive Summary

This report analyzes the architectural trade-offs between Finite State Machine (FSM) and Redux approaches for implementing board games, using the tic-tac-toe implementations in this codebase as a foundation. The analysis covers separation of concerns, extensibility, testability, and performance considerations, with specific focus on scaling from simple games like tic-tac-toe to complex games like chess.

**Key Finding**: FSM is more natural for single complex board games, while Redux excels for multi-game platforms with cross-cutting concerns.

## Table of Contents

1. [Current Architecture Overview](#current-architecture-overview)
2. [Separation of Concerns Analysis](#separation-of-concerns-analysis)
3. [Extensibility Comparison](#extensibility-comparison)
4. [Testability Assessment](#testability-assessment)
5. [Performance Considerations](#performance-considerations)
6. [Board Game Specific Analysis](#board-game-specific-analysis)
7. [Recommendations](#recommendations)
8. [Conclusion](#conclusion)

## Current Architecture Overview

The codebase implements two distinct approaches to tic-tac-toe state management:

### FSM Implementation (`finite-state-machine/`)
- **Core**: `TicTacToeFSM` class (280 lines) with explicit state enum
- **States**: `'SETUP' | 'X_TURN' | 'O_TURN' | 'AI_THINKING' | 'X_WIN' | 'O_WIN' | 'DRAW'`
- **Pattern**: Single class containing all game logic with direct state transitions
- **Adapter**: `xstateAdapter.ts` bridges to shared UI components

### Redux Implementation (`global-state-strategy/`)
- **Core**: Redux Toolkit slice with reducers and thunks (169 lines)
- **States**: Inferred from properties (`isSetup`, `currentPlayer`, `winner`)
- **Pattern**: Distributed logic across reducers, actions, and thunks
- **Adapter**: `reduxAdapter.ts` bridges to shared UI components

### Shared Architecture
Both implementations use the **Adapter Pattern** with a shared views library (`@tic-tac-toe/views`), allowing the same UI components to work with either state management approach.

## Separation of Concerns Analysis

### FSM Approach

**Strengths:**
- **Single Responsibility**: One class handles all game logic
- **Cohesive Design**: Related game mechanics bundled together
- **Clear Boundaries**: State machine logic encapsulated in one place

**Weaknesses:**
- **Tight Coupling**: All concerns bundled in single class
- **Monolithic Growth**: Could become unwieldy with complex features

```typescript
// FSM: All game logic in one place
export class TicTacToeFSM {
  private state: TTTState = 'SETUP';
  private context: Context;
  
  dispatch(ev: TTTEvent) { this.handle(ev); }
  private playerMove(i: number, symbol?: 'X' | 'O') { /* game logic */ }
  private maybeAutoMove() { /* AI logic */ }
  private updateStateAfterMove() { /* win detection */ }
}
```

### Redux Approach

**Strengths:**
- **Distributed Concerns**: State, actions, and side effects separated
- **Loose Coupling**: Each file has focused responsibility
- **Modular Design**: Easy to add orthogonal features

**Weaknesses:**
- **Indirection**: Logic scattered across multiple files
- **Boilerplate**: More setup required for simple operations

```typescript
// Redux: Separated concerns
const gameSlice = createSlice({
  name: 'game',
  reducers: { /* pure state updates */ }
});

export const makeMove = (): AppThunk => (dispatch, getState) => {
  /* async logic separated from reducers */
};
```

**Winner**: Redux for larger applications, FSM for focused game logic

## Extensibility Comparison

### Board Size Variations (3x3 → 4x4 Tic-Tac-Toe)

**Current Hardcoded Dependencies:**
```typescript
// Both approaches currently hardcode 9 cells
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]; // FSM
board: Array(9).fill(null), // Redux
```

**Required Changes for 4x4:**

**FSM Extension:**
```typescript
interface Context {
  board: Cell[];
  boardSize: number; // New: parameterized size
  mode: GameMode;
  // ... rest unchanged
}

constructor(opts: Options = {}) {
  const size = opts.boardSize || 3;
  this.context = {
    board: Array(size * size).fill(null),
    boardSize: size,
    // ... existing logic works unchanged
  };
}
```

**Redux Extension:**
```typescript
interface GameState {
  board: SquareValue[];
  boardSize: number; // New: parameterized size
  // ... rest unchanged
}

// Strategy pattern in shared views handles win conditions
const strategy = createGameStrategy(state.mode, state.boardSize);
```

**Extensibility Assessment**: **Tie** - Both need similar parameterization changes.

### Complex Board Games (Chess-like Games)

**FSM Advantages:**
```typescript
type ChessState = 
  | 'WHITE_TURN' 
  | 'BLACK_TURN'
  | 'WHITE_CHECK' 
  | 'BLACK_CHECK'
  | 'AWAITING_PROMOTION'
  | 'CASTLING_RIGHTS_LOST'
  | 'EN_PASSANT_AVAILABLE';

// Natural game rule modeling
private handleCastling(move: CastlingMove) {
  if (this.state !== 'WHITE_TURN' && this.state !== 'BLACK_TURN') return;
  if (this.canCastle(move)) {
    this.executeMove(move);
    this.state = this.getNextState();
  }
}
```

**Redux Challenges:**
```typescript
// Must infer complex states from properties
interface ChessState {
  currentPlayer: 'white' | 'black';
  isInCheck: boolean;
  castlingRights: CastlingRights;
  enPassantSquare?: Square;
  // State must be computed rather than explicit
}

// Multiple actions needed for complex moves
dispatch(validateCastling(move));
dispatch(movePieces(castlingMoves));
dispatch(updateCastlingRights());
dispatch(checkForCheck());
```

**Winner**: FSM for complex single-game rules, Redux for multi-game platforms

### Platform Scaling

**Redux Advantages:**
```typescript
// Easy horizontal scaling
const store = configureStore({
  reducer: {
    ticTacToe: ticTacToeReducer,
    chess: chessReducer,
    checkers: checkersReducer,
    user: userReducer,
    chat: chatReducer,
    lobby: lobbyReducer,
    leaderboard: leaderboardReducer
  }
});

// Cross-cutting concerns via middleware
const gameMiddleware = (store) => (next) => (action) => {
  logMove(action);        // Automatic logging
  persistState(action);   // Auto-save
  syncMultiplayer(action); // Real-time sync
  return next(action);
};
```

**FSM Challenges:**
```typescript
// Harder to compose multiple game engines
class GamePlatform {
  private ticTacToeEngine: TicTacToeFSM;
  private chessEngine: ChessFSM;
  private userManager: UserManager; // Separate system
  private chatSystem: ChatSystem;   // Separate system
  
  // Manual coordination required
}
```

**Winner**: Redux for platform features and horizontal scaling

## Testability Assessment

### FSM Testing

**Advantages:**
```typescript
// Direct, integration-style testing
const fsm = new TicTacToeFSM();
fsm.dispatch({ type: 'START_GAME' });
expect(fsm.getState()).toBe('X_TURN');

// Natural workflow testing
fsm.dispatch({ type: 'MOVE', index: 0 });
fsm.dispatch({ type: 'MOVE', index: 1 });
expect(fsm.getWinner()).toBe('X');
```

**Challenges:**
```typescript
// Async AI testing complexity
it('should make AI move', (done) => {
  jest.useFakeTimers();
  const fsm = new TicTacToeFSM();
  fsm.setOnStateChange(() => {
    if (fsm.getState() === 'O_TURN') {
      expect(fsm.getBoard()).toContain('O');
      done();
    }
  });
  // Complex setup for async behavior
});

// Cannot test private methods directly
// Must test through public interface only
```

### Redux Testing

**Advantages:**
```typescript
// Pure function testing
const initialState = { /* ... */ };
const action = setMode('wild');
const newState = gameReducer(initialState, action);
expect(newState.mode).toBe('wild');

// Individual action testing
const action = setPlayerType({ playerId: 'player1', playerType: 'computer' });
expect(action.type).toBe('game/setPlayerType');

// Thunk testing with mocks
const dispatch = jest.fn();
const getState = jest.fn(() => ({ game: mockState }));
const thunk = makeMove({ index: 0 });
thunk(dispatch, getState);
expect(dispatch).toHaveBeenCalledWith(_makeMove({ index: 0 }));
```

**Challenges:**
```typescript
// State shape dependencies
const mockState = {
  game: {
    board: Array(9).fill(null),
    currentPlayer: { /* exact structure required */ },
    // All properties must be mocked correctly
  }
};

// Async thunk complexity
jest.spyOn(global, 'setTimeout');
// More setup for async behavior
```

**Testing Winner**: Redux for unit testing, FSM for integration testing

## Performance Considerations

### Memory Usage
- **FSM**: Single mutable object, minimal memory overhead
- **Redux**: Immutable state copies, higher memory usage but predictable
- **Winner**: FSM for raw memory efficiency

### CPU Performance
- **FSM**: Direct method calls, no serialization overhead
- **Redux**: Action dispatching through middleware pipeline
- **Winner**: FSM for simple operations, Redux benefits from memoization for complex derived state

### Development Performance
- **FSM**: Simple debugging through direct state inspection
- **Redux**: Time-travel debugging, action history, DevTools integration
- **Winner**: Redux for debugging and developer experience

## Board Game Specific Analysis

### Turn-Based Game Mechanics

**FSM Natural Modeling:**
```typescript
// Game flow maps directly to states
type GameState = 'PLAYER1_TURN' | 'PLAYER2_TURN' | 'GAME_OVER';

// Rules become state transition guards
private makeMove(move: Move) {
  if (this.state === 'GAME_OVER') return;
  if (!this.isValidMove(move)) return;
  
  this.executeMove(move);
  this.state = this.getNextState();
}
```

**Redux Indirect Modeling:**
```typescript
// Must compute turn state
const getCurrentPlayer = (state) => 
  state.currentPlayer === 'player1' ? state.players.player1 : state.players.player2;

// Rules in reducers
const gameReducer = (state, action) => {
  if (state.winner) return state; // Game over guard
  if (!isValidMove(state.board, action.payload.index)) return state;
  // ... update logic
};
```

### Complex Game States

**Chess Example - FSM:**
```typescript
type ChessState = 
  | 'WHITE_TURN'
  | 'BLACK_TURN' 
  | 'WHITE_CHECK'
  | 'BLACK_CHECK'
  | 'AWAITING_PROMOTION'
  | 'CHECKMATE'
  | 'STALEMATE';

// State is explicit and visible
if (this.state === 'WHITE_CHECK') {
  // Handle check-specific logic
  this.highlightThreats();
  this.restrictMoves();
}
```

**Chess Example - Redux:**
```typescript
interface ChessState {
  currentPlayer: 'white' | 'black';
  isInCheck: boolean;
  pendingPromotion?: PawnPromotionData;
  gameResult?: 'checkmate' | 'stalemate' | 'draw';
}

// State must be computed
const isPlayerInCheck = createSelector(
  [getBoard, getCurrentPlayer],
  (board, player) => calculateCheck(board, player)
);
```

**Winner**: FSM for explicit game state modeling

## Recommendations

### When to Choose FSM

**Ideal for:**
- Complex single board games (Chess, Go, Checkers)
- Games with many explicit states (check, checkmate, promotion)
- Turn-based games with clear state transitions
- Performance-critical games
- Teams preferring direct, imperative style

**Example Architecture:**
```typescript
class ChessEngine extends FSM {
  private state: ChessState;
  private board: ChessBoard;
  private rules: ChessRules;
  
  makeMove(move: Move) {
    if (!this.rules.isLegal(move, this.state)) return false;
    
    this.board.execute(move);
    this.state = this.rules.nextState(this.board, this.state);
    this.notifyStateChange();
    return true;
  }
}
```

### When to Choose Redux

**Ideal for:**
- Multi-game platforms
- Games with complex UI state management
- Applications requiring time-travel debugging
- Large teams preferring established patterns
- Games with many orthogonal features (chat, leaderboards, etc.)

**Example Architecture:**
```typescript
const gameStore = configureStore({
  reducer: {
    games: combineReducers({
      ticTacToe: ticTacToeSlice.reducer,
      chess: chessSlice.reducer,
      checkers: checkersSlice.reducer
    }),
    user: userSlice.reducer,
    lobby: lobbySlice.reducer,
    chat: chatSlice.reducer
  },
  middleware: [gameLoggingMiddleware, persistenceMiddleware]
});
```

### Hybrid Approach (Recommended)

**Best of Both Worlds:**
```typescript
// FSM for game logic
class GameEngine {
  private chessFSM: ChessFSM;
  private store: Store;
  
  makeMove(move: Move) {
    const success = this.chessFSM.makeMove(move);
    if (success) {
      // Sync to Redux for UI/platform features
      this.store.dispatch(gameStateUpdated({
        gameId: this.gameId,
        state: this.chessFSM.getPublicState()
      }));
    }
    return success;
  }
}

// Redux for platform state
const platformStore = configureStore({
  reducer: {
    activeGames: activeGamesSlice.reducer,
    user: userSlice.reducer,
    lobby: lobbySlice.reducer,
    chat: chatSlice.reducer
  }
});
```

### Architecture Guidelines

1. **Single Game Focus**: Use FSM for core game logic
2. **Platform Features**: Use Redux for user management, lobbies, chat
3. **Adapter Layer**: Maintain abstraction between state management and UI
4. **Performance Critical**: Prefer FSM for real-time or complex calculations
5. **Team Experience**: Consider team familiarity with patterns

## Conclusion

The analysis reveals that both FSM and Redux approaches have distinct strengths:

### FSM Excels At:
- **Natural Game Modeling**: States like `WHITE_CHECK` map directly to game concepts
- **Performance**: Direct method calls and mutable state for efficiency
- **Turn-Based Flow**: State transitions mirror game progression
- **Complex Game Rules**: State-based guards feel natural for game logic

### Redux Excels At:
- **Scalability**: Proven patterns for large applications
- **Testability**: Pure functions and isolated testing
- **Platform Features**: Easy to add chat, lobbies, user management
- **Developer Experience**: Excellent tooling and debugging capabilities

### Key Insight: Architecture Matches Problem Domain

The current codebase's **Adapter Pattern is architecturally sound** - it allows choosing the optimal state management approach per game while maintaining UI consistency.

**For this tic-tac-toe codebase specifically:**
- The FSM implementation is more natural and performant
- The Redux implementation offers better testing and scalability
- Both benefit from the shared views abstraction

**For future development:**
- **Simple → Complex Games**: Start with FSM, add Redux for platform features
- **Multi-Game Platform**: Use Redux as primary with FSM engines for complex games
- **Performance Critical**: Prefer FSM for game logic, Redux for everything else

The optimal architecture depends on your specific requirements, but the patterns demonstrated in this codebase provide excellent foundations for either approach.

---

*This analysis is based on the finite-state-machine and global-state-strategy implementations in the tic-tac-toe-playground repository, examined on 2025-07-24.*