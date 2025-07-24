GameEngine as a custom hook
States:
p1IsAi: boolean;
p2IsAi: boolean;
mode: 'standard' | 'wild';
board: Board;
currentMoveBy: P1|P2;
errorMessage: string | null;

PlayerMove class that is inherited by
StandardMove(p1IsAi: boolean, p2IsAi: boolean, board: Board, currentMoveBy: P1|P2, location: number) {
board.place(location, currentMoveBy === 'P1' ? 'X' : 'O');
if (currentMoveBy === 'P1' && p2IsAi) {
const move = aiMove(board, 'O');
return new StandardMove(p1IsAi, p2IsAi, board, 'P2', move.location);
}
if (currentMoveBy === 'P2' && p1IsAi) {
const move = aiMove(board, 'X');
return new StandardMove(p1IsAi, p2IsAi, board, 'P1', move.location);
}
}

WildMove(p1IsAi: boolean, p2IsAi: boolean, board: Board, currentMoveBy: P1|P2, location: number, symbol: 'X' | 'O') {
board.place(location, symbol);
if (currentMoveBy === 'P1' && p2IsAi) {
const move = aiMove(board, 'O');
return new WildMove(p1IsAi, p2IsAi, board, 'P2', move.location, 'O');
}
if (currentMoveBy === 'P2' && p1IsAi) {
const move = aiMove(board, 'X');
return new WildMove(p1IsAi, p2IsAi, board, 'P1', move.location, 'X');
}

Board class
occupancy: Square[];
hasEnded(): boolean;
turnOwner: P1|P2;
getWinner(): P1|P2|null|undefined;
place(location: number, symbol: 'X' | 'O'): void throws Error;

State Machine implementation

```
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
type GameState = 'Initialising' | 'P1Thinking' | 'P2Thinking' | 'Finished';
type GameEvent = 'BEGIN' | 'P1Placed' | 'P2Placed';

const board = new Board();

export const game = new StateMachine<GameState, GameEvent>(
  'Initialising',
  [
    { from: 'Initialising',       to: 'P1Thinking', on: 'BEGIN' },

    { from: 'P1Thinking',  to: 'Finished', on: 'P1Placed', guard: () => board.isGameEnded() },
    { from: 'P1Thinking',  to: 'P2Thinking', on: 'P1Placed', guard: () => !board.isGameEnded() },

    { from: 'P2Thinking',  to: 'Finished', on: 'P2Placed', guard: () => board.isGameEnded() },
    { from: 'P2Thinking',  to: 'P1Thinking', on: 'P2Placed', guard: () => !board.isGameEnded() },
  ]
);

/* ----------------- demo sequence ----------------- */
game.dispatch('BEGIN');         // Initialising → P1Thinking

board.place(0, 'X');            // P1 move
game.dispatch('P1Placed');        // P1Thinking → P2Thinking

board.place(4, 'O');            // P2 move
game.dispatch('P2Placed');        // P2Thinking → P1Thinking (still playing)

/* ...continue moves until board.isGameEnded() === true, then FSM → Finished */
```
