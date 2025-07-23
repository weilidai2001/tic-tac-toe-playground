import { calculateWinner, isBoardFull, getAIMove } from '@tic-tac-toe/views';

type Cell = 'X' | 'O' | null;
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
type TTTState = 'X_TURN' | 'O_TURN' | 'X_WIN' | 'O_WIN' | 'DRAW';
type TTTEvent = { type: 'MOVE'; index: number; symbol?: 'X' | 'O' } | { type: 'RESET' };
type GameMode = 'standard' | 'wild';

interface Options {
  computerPlaysX?: boolean;
  computerPlaysO?: boolean;
  mode?: GameMode;
}

export class TicTacToeFSM {
  private state: TTTState = 'X_TURN';
  private board: Board = Array(9).fill(null) as Board;
  private mode: GameMode;

  constructor(private readonly opts: Options = {}) {
    this.mode = opts.mode || 'standard';
    // let the computer open if it's X
    this.maybeAutoMove();
  }

  // ---------- public API ----------
  getState() { return this.state; }
  getBoard() { return this.board; }
  getMode() { return this.mode; }
  dispatch(ev: TTTEvent) { this.handle(ev); }

  // ---------- internals ----------
  private handle(ev: TTTEvent) {
    if (ev.type === 'RESET') return this.reset();
    if (ev.type === 'MOVE') this.playerMove(ev.index, ev.symbol);
  }

  private playerMove(i: number, symbol?: 'X' | 'O') {
    if (this.stateEnds() || this.board[i] !== null) return;

    let player: 'X' | 'O';
    
    if (this.mode === 'wild' && symbol) {
      // In wild mode, use the provided symbol
      player = symbol;
    } else {
      // In standard mode, use current turn's symbol
      player = this.state === 'X_TURN' ? 'X' : 'O';
    }

    this.board[i] = player;
    this.updateStateAfterMove(player);
    this.maybeAutoMove();
  }

  private maybeAutoMove() {
    const { computerPlaysX, computerPlaysO } = this.opts;
    if (
      (this.state === 'X_TURN' && computerPlaysX) ||
      (this.state === 'O_TURN' && computerPlaysO)
    ) {
      const move = this.pickAIMove();
      if (move.index !== -1) {
        this.playerMove(move.index, move.symbol);
      }
    }
  }

  private pickAIMove(): { index: number; symbol?: 'X' | 'O' } {
    const currentSymbol = this.state === 'X_TURN' ? 'X' : 'O';
    const move = getAIMove(this.board, this.mode, currentSymbol);
    return {
      index: move.index,
      symbol: move.symbol as 'X' | 'O' | undefined
    };
  }

  private updateStateAfterMove(_p: 'X' | 'O') {
    const winner = calculateWinner(this.board);
    if (winner) {
      this.state = winner === 'X' ? 'X_WIN' : 'O_WIN';
    } else if (isBoardFull(this.board)) {
      this.state = 'DRAW';
    } else {
      // In standard mode, alternate turns
      // In wild mode, turns still alternate (player turns, not symbol ownership)
      this.state = this.state === 'X_TURN' ? 'O_TURN' : 'X_TURN';
    }
  }

  private reset() {
    this.state = 'X_TURN';
    this.board.fill(null);
    this.maybeAutoMove();
  }

  private stateEnds() {
    return this.state === 'X_WIN' || this.state === 'O_WIN' || this.state === 'DRAW';
  }
}