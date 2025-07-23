import { calculateWinner, isBoardFull, getAIMove } from '@tic-tac-toe/views';

type Cell = 'X' | 'O' | null;
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
type TTTState = 'X_TURN' | 'O_TURN' | 'AI_THINKING' | 'X_WIN' | 'O_WIN' | 'DRAW';
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
  private aiTimeout: number | null = null;

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
  isXTurn() { return this.wasXTurn(); }

  // ---------- internals ----------
  private handle(ev: TTTEvent) {
    if (ev.type === 'RESET') return this.reset();
    if (ev.type === 'MOVE') this.playerMove(ev.index, ev.symbol);
  }

  private playerMove(i: number, symbol?: 'X' | 'O') {
    if (this.stateEnds() || this.board[i] !== null || this.state === 'AI_THINKING') return;

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
      this.state = 'AI_THINKING';
      
      // Clear any existing timeout
      if (this.aiTimeout) {
        clearTimeout(this.aiTimeout);
      }
      
      // Add artificial delay for AI thinking
      this.aiTimeout = setTimeout(() => {
        const move = this.pickAIMove();
        if (move.index !== -1) {
          // Temporarily switch back to the appropriate turn state for the move
          this.state = computerPlaysX && this.wasXTurn() ? 'X_TURN' : 'O_TURN';
          this.playerMove(move.index, move.symbol);
        }
        this.aiTimeout = null;
      }, 1500);
    }
  }

  private wasXTurn(): boolean {
    // Helper to determine if we were in X's turn before AI_THINKING
    // We can infer this from the current board state and player configuration
    const { computerPlaysX, computerPlaysO } = this.opts;
    const moveCount = this.board.filter(cell => cell !== null).length;
    
    if (computerPlaysX && computerPlaysO) {
      // Both are computers, alternate based on move count
      return moveCount % 2 === 0;
    } else if (computerPlaysX) {
      // Only X is computer, so if we're in AI_THINKING, it must be X's turn
      return true;
    } else if (computerPlaysO) {
      // Only O is computer, so if we're in AI_THINKING, it must be O's turn
      return false;
    }
    
    // Shouldn't reach here if maybeAutoMove was called correctly
    return moveCount % 2 === 0;
  }

  private pickAIMove(): { index: number; symbol?: 'X' | 'O' } {
    // Determine which symbol the AI should use based on the game state
    const currentSymbol = this.wasXTurn() ? 'X' : 'O';
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
    // Clear any pending AI timeout
    if (this.aiTimeout) {
      clearTimeout(this.aiTimeout);
      this.aiTimeout = null;
    }
    
    this.state = 'X_TURN';
    this.board.fill(null);
    this.maybeAutoMove();
  }

  private stateEnds() {
    return this.state === 'X_WIN' || this.state === 'O_WIN' || this.state === 'DRAW';
  }
}