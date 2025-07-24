# Tic-Tac-Toe Game Engine Architecture Design (Revised)

## Overview

This document specifies a revised architecture for a tic-tac-toe game engine supporting both standard and wild game modes, with human and AI players. The design uses an event-driven finite state machine for game flow control, eliminating the problematic PlayerMove strategy pattern in favor of a more React-compatible approach.

## Core Architecture

### GameEngine (Custom Hook)

**Purpose**: Main game controller implemented as a React custom hook that wraps the state machine and provides React integration.

```typescript
interface GameEngineState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  mode: 'standard' | 'wild';
  players: {
    player1: Player;
    player2: Player;
  };
  gameState: 'setup' | 'playing' | 'ai_thinking' | 'finished';
  errorMessage: string | null;
  isAITurn: boolean;
}

interface GameEngineActions {
  initialize(): void;
  startGame(): void;
  makeMove(location: number, symbol?: 'X' | 'O'): void;
  resetGame(): void;
  resetToSetup(): void;
  setGameMode(mode: 'standard' | 'wild'): void;
  setPlayerType(player: 'player1' | 'player2', type: 'human' | 'computer'): void;
  clearError(): void;
}

function useGameEngine(): GameEngineState & GameEngineActions
```

**Implementation**:
```typescript
export function useGameEngine(): GameEngineState & GameEngineActions {
  const [fsm] = useState(() => new TicTacToeStateMachine());
  const [gameState, setGameState] = useState(() => fsm.getGameState());

  // Set up callback for all state changes (including AI moves)
  fsm.setOnStateChange(() => setGameState(fsm.getGameState()));

  const actions = {
    initialize: () => fsm.dispatch({ type: 'INITIALIZE' }),
    startGame: () => fsm.dispatch({ type: 'START_GAME' }),
    makeMove: (location: number, symbol?: 'X' | 'O') => 
      fsm.dispatch({ type: 'MOVE', location, symbol }),
    resetGame: () => fsm.dispatch({ type: 'RESET' }),
    resetToSetup: () => fsm.dispatch({ type: 'RESET_TO_SETUP' }),
    setGameMode: (mode: 'standard' | 'wild') => 
      fsm.dispatch({ type: 'SET_MODE', mode }),
    setPlayerType: (player: 'player1' | 'player2', type: 'human' | 'computer') => 
      fsm.dispatch({ type: 'SET_PLAYER_TYPE', player, type }),
    clearError: () => fsm.dispatch({ type: 'CLEAR_ERROR' })
  };

  return { ...gameState, ...actions };
}
```

### Board Class

**Purpose**: Manages game board state and game logic with proper winner tracking.

```typescript
type Cell = ' ' | 'X' | 'O';
type Player = 'player1' | 'player2';

interface MoveHistory {
  location: number;
  symbol: 'X' | 'O';
  player: Player;
  moveNumber: number;
}

class Board {
  private grid: Cell[] = Array(9).fill(' ') as Cell[];
  private moveHistory: MoveHistory[] = [];
  private currentPlayer: Player = 'player1';

  place(location: number, symbol: 'X' | 'O', player: Player): void {
    if (location < 0 || location > 8) {
      throw new Error('Invalid location: must be 0-8');
    }
    if (this.grid[location] !== ' ') {
      throw new Error('Cell already occupied');
    }
    
    this.grid[location] = symbol;
    this.moveHistory.push({
      location,
      symbol,
      player,
      moveNumber: this.moveHistory.length + 1
    });
    
    // Set next player after placing move
    this.currentPlayer = player === 'player1' ? 'player2' : 'player1';
  }

  getCellValue(location: number): Cell {
    if (location < 0 || location > 8) {
      throw new Error('Invalid location: must be 0-8');
    }
    return this.grid[location];
  }

  isGameEnded(): boolean {
    return this.getWinner() !== null || this.isFull();
  }

  getWinner(): Player | 'draw' | null {
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of winningLines) {
      if (this.grid[a] !== ' ' && 
          this.grid[a] === this.grid[b] && 
          this.grid[b] === this.grid[c]) {
        // The winner is the previous player (since currentPlayer switched after the winning move)
        return this.currentPlayer === 'player1' ? 'player2' : 'player1';
      }
    }
    
    return this.isFull() ? 'draw' : null;
  }

  getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  getMoveCount(): number {
    return this.moveHistory.length;
  }

  getLastMove(): MoveHistory | null {
    return this.moveHistory[this.moveHistory.length - 1] || null;
  }

  clone(): Board {
    const newBoard = new Board();
    newBoard.grid = [...this.grid];
    newBoard.moveHistory = [...this.moveHistory];
    newBoard.currentPlayer = this.currentPlayer;
    return newBoard;
  }

  reset(): void {
    this.grid = Array(9).fill(' ') as Cell[];
    this.moveHistory = [];
    this.currentPlayer = 'player1';
  }

  toArray(): Cell[] {
    return [...this.grid];
  }

  private isFull(): boolean {
    return this.grid.every(cell => cell !== ' ');
  }

}
```

### TicTacToeStateMachine

**Purpose**: Event-driven state machine that controls game flow and handles AI chaining.

```typescript
/* ----------------- core framework (guards + multiple choices) ---------------- */
export interface Transition<S extends string, E extends string> {
    from: S;
    to: S;
    on: E;
    guard?: () => boolean;
    action?: () => void;
}

export class StateMachine<S extends string, E extends string> {
    #state: S;
    #table: Map<S, Map<E, Transition<S, E>[]>> = new Map();

    constructor(initial: S, transitions: Transition<S, E>[]) {
        this.#state = initial;
        transitions.forEach(t => {
            if (!this.#table.has(t.from)) this.#table.set(t.from, new Map());
            const bucket = this.#table.get(t.from)!.get(t.on) ?? [];
            bucket.push(t);
            this.#table.get(t.from)!.set(t.on, bucket);
        });
    }

    get state(): S {
        return this.#state;
    }

    dispatch(event: E): S {
        const options = this.#table.get(this.#state)?.get(event);
        if (!options?.length) {
            throw new Error(`No transition for "${event}" from "${this.#state}".`);
        }
        const chosen = options.find(tr => !tr.guard || tr.guard());
        if (!chosen) {
            throw new Error(`All guards blocked "${event}" from "${this.#state}".`);
        }
        chosen.action?.();
        this.#state = chosen.to;
        return this.#state;
    }
}

/* ----------------- tic-tac-toe board utility ----------------- */
type Cell = ' ' | 'X' | 'O';

export class Board {
    #g: Cell[] = Array(9).fill(' ') as Cell[];

    place(pos: number, mark: 'X' | 'O') {
        if (pos < 0 || pos > 8 || this.#g[pos] !== ' ') throw new Error('Invalid move');
        this.#g[pos] = mark;
    }

    isGameEnded(): boolean {
        const g = this.#g;
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        const win = lines.some(([a, b, c]) => g[a] !== ' ' && g[a] === g[b] && g[b] === g[c]);
        const draw = g.every(c => c !== ' ');
        return win || draw;
    }
}

/* ----------------- game FSM wiring ----------------- */
type GameState = 'start' | 'P1Thinking' | 'P2Thinking' | 'GameFinish';
type GameEvent = 'BEGIN' | 'P1DONE' | 'P2DONE';

const board = new Board();

export const game = new StateMachine<GameState, GameEvent>(
    'start',
    [
        { from: 'start',       to: 'P1Thinking', on: 'BEGIN' },

        { from: 'P1Thinking',  to: 'GameFinish', on: 'P1DONE', guard: () => board.isGameEnded() },
        { from: 'P1Thinking',  to: 'P2Thinking', on: 'P1DONE', guard: () => !board.isGameEnded() },

        { from: 'P2Thinking',  to: 'GameFinish', on: 'P2DONE', guard: () => board.isGameEnded() },
        { from: 'P2Thinking',  to: 'P1Thinking', on: 'P2DONE', guard: () => !board.isGameEnded() },
    ]
);

/* ----------------- demo sequence ----------------- */
game.dispatch('BEGIN');         // start → P1Thinking

board.place(0, 'X');            // P1 move
game.dispatch('P1DONE');        // → P2Thinking

board.place(4, 'O');            // P2 move
game.dispatch('P2DONE');        // → P1Thinking (still playing)

/* ...continue moves until board.isGameEnded() === true, then FSM → GameFinish */
```

### AI Strategy Interface

**Purpose**: Pluggable AI implementations for different difficulty levels and modes.

```typescript
interface AIStrategy {
  calculateMove(board: Board, player: Player, mode: 'standard' | 'wild'): {
    location: number;
    symbol?: 'X' | 'O';
  };
}

class RandomAI implements AIStrategy {
  calculateMove(board: Board, player: Player, mode: 'standard' | 'wild') {
    const availableSpots = board.toArray()
      .map((cell, index) => cell === ' ' ? index : -1)
      .filter(index => index !== -1);
    
    const location = availableSpots[Math.floor(Math.random() * availableSpots.length)];
    
    if (mode === 'wild') {
      const symbol = Math.random() < 0.5 ? 'X' : 'O';
      return { location, symbol };
    } else {
      return { location };
    }
  }
}

class MinimaxAI implements AIStrategy {
  calculateMove(board: Board, player: Player, mode: 'standard' | 'wild') {
    // TODO: Implement minimax algorithm
    return new RandomAI().calculateMove(board, player, mode);
  }
}
```

## Component Integration

### React Component Structure

```typescript
function TicTacToeGame() {
  const gameEngine = useGameEngine();
  
  useEffect(() => {
    gameEngine.initialize();
  }, []);

  return (
    <div className="game-container">
      <GameControls 
        mode={gameEngine.mode}
        players={gameEngine.players}
        gameState={gameEngine.gameState}
        onModeChange={gameEngine.setGameMode}
        onPlayerTypeChange={gameEngine.setPlayerType}
        onStartGame={gameEngine.startGame}
        onReset={gameEngine.resetGame}
        onResetToSetup={gameEngine.resetToSetup}
      />
      <BoardComponent 
        board={gameEngine.board.toArray()}
        onCellClick={gameEngine.makeMove}
        gameState={gameEngine.gameState}
        isAITurn={gameEngine.isAITurn}
      />
      <GameStatus 
        currentPlayer={gameEngine.currentPlayer}
        winner={gameEngine.winner}
        gameState={gameEngine.gameState}
        errorMessage={gameEngine.errorMessage}
        onClearError={gameEngine.clearError}
      />
    </div>
  );
}
```

## Key Architectural Improvements

1. **Event-Driven Architecture**: Replaced PlayerMove strategy with FSM events, ensuring proper React integration and state consistency.

2. **Proper AI Chain Handling**: AI moves are scheduled with timeouts, allowing proper state updates and preventing infinite loops in AI-vs-AI scenarios.

3. **Accurate Winner Detection**: Board tracks move history to correctly identify winning players, especially in wild mode where symbols don't map to specific players.

4. **Clear State Separation**: Setup, playing, AI thinking, and finished states are explicitly managed, preventing invalid transitions.

5. **Initialize/Start Separation**: Clear distinction between initialization (setting up the game) and starting (beginning gameplay).

6. **Error Handling**: Comprehensive error states with user-friendly messages and recovery mechanisms.

7. **Extensible AI**: Pluggable AI strategies allow for different difficulty levels and strategic approaches.

This revised architecture is feasible, React-compatible, and handles all the complex scenarios including AI-vs-AI games, proper winner detection, and state management.