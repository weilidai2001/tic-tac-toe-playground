import { calculateWinner, isBoardFull, getAIMove, GameMode, PlayerType, SquareValue } from '@tic-tac-toe/views';

type Cell = 'X' | 'O' | null;
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
type TTTState = 'SETUP' | 'X_TURN' | 'O_TURN' | 'AI_THINKING' | 'X_WIN' | 'O_WIN' | 'DRAW';
type TTTEvent = 
  | { type: 'MOVE'; index: number; symbol?: 'X' | 'O' }
  | { type: 'RESET' }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_PLAYER_TYPE'; playerId: 'player1' | 'player2'; playerType: PlayerType }
  | { type: 'START_GAME' }
  | { type: 'RESET_TO_SETUP' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' };

interface Player {
  id: 'player1' | 'player2';
  type: PlayerType;
  symbol: SquareValue;
}

interface Context {
  board: Board;
  mode: GameMode;
  players: {
    player1: Player;
    player2: Player;
  };
  errorMessage?: string;
}

interface Options {
  computerPlaysX?: boolean;
  computerPlaysO?: boolean;
  mode?: GameMode;
}

export class TicTacToeFSM {
  private state: TTTState = 'SETUP';
  private context: Context;
  private aiTimeout: number | null = null;
  private onStateChange?: () => void;

  constructor(private readonly opts: Options = {}) {
    this.context = {
      board: Array(9).fill(null) as Board,
      mode: opts.mode || 'standard',
      players: {
        player1: { id: 'player1', type: 'human', symbol: 'X' },
        player2: { id: 'player2', type: 'human', symbol: 'O' }
      },
      errorMessage: undefined
    };
  }

  // ---------- public API ----------
  getState() { return this.state; }
  getContext() { return this.context; }
  getBoard() { return this.context.board; }
  getMode() { return this.context.mode; }
  getPlayers() { return this.context.players; }
  getErrorMessage() { return this.context.errorMessage; }
  isSetup() { return this.state === 'SETUP'; }
  dispatch(ev: TTTEvent) { this.handle(ev); }
  isXTurn() { return this.wasXTurn(); }
  
  setOnStateChange(callback: () => void) {
    this.onStateChange = callback;
  }

  getCurrentPlayer() {
    const players = this.context.players;
    return (this.state === 'X_TURN' || this.state === 'X_WIN' || (this.state === 'AI_THINKING' && this.isXTurn())) 
      ? players.player1 : players.player2;
  }

  getWinner(): SquareValue | 'draw' | null {
    return this.state === 'X_WIN' ? 'X' : this.state === 'O_WIN' ? 'O' : this.state === 'DRAW' ? 'draw' : null;
  }

  getIsAITurn(): boolean {
    const currentPlayer = this.getCurrentPlayer();
    return this.state === 'AI_THINKING' || (currentPlayer.type === 'computer' && (this.state === 'X_TURN' || this.state === 'O_TURN'));
  }

  getGameState() {
    return {
      board: this.context.board,
      currentPlayer: this.getCurrentPlayer(),
      winner: this.getWinner(),
      mode: this.context.mode,
      players: this.context.players,
      isSetup: this.isSetup(),
      isAITurn: this.getIsAITurn(),
      errorMessage: this.context.errorMessage
    };
  }

  // ---------- internals ----------
  private handle(ev: TTTEvent) {
    switch (ev.type) {
      case 'SET_MODE':
        this.setMode(ev.mode);
        break;
      case 'SET_PLAYER_TYPE':
        this.setPlayerType(ev.playerId, ev.playerType);
        break;
      case 'START_GAME':
        this.startGame();
        break;
      case 'MOVE':
        this.playerMove(ev.index, ev.symbol);
        break;
      case 'RESET':
        this.reset();
        break;
      case 'RESET_TO_SETUP':
        this.resetToSetup();
        break;
      case 'SET_ERROR':
        this.context.errorMessage = ev.message;
        break;
      case 'CLEAR_ERROR':
        this.context.errorMessage = undefined;
        break;
    }
    this.onStateChange?.();
  }

  private notifyStateChange() {
    this.onStateChange?.();
  }

  private setMode(mode: GameMode) {
    if (this.state !== 'SETUP') return;
    
    this.context.mode = mode;
    if (mode === 'wild') {
      this.context.players.player1.symbol = null;
      this.context.players.player2.symbol = null;
    } else {
      this.context.players.player1.symbol = 'X';
      this.context.players.player2.symbol = 'O';
    }
  }

  private setPlayerType(playerId: 'player1' | 'player2', playerType: PlayerType) {
    if (this.state !== 'SETUP') return;
    
    this.context.players[playerId].type = playerType;
  }

  private startGame() {
    if (this.state !== 'SETUP') return;
    
    this.state = 'X_TURN';
    this.context.board = Array(9).fill(null) as Board;
    this.maybeAutoMove();
  }

  private resetToSetup() {
    if (this.aiTimeout) {
      clearTimeout(this.aiTimeout);
      this.aiTimeout = null;
    }
    
    this.state = 'SETUP';
    this.context.board = Array(9).fill(null) as Board;
    this.context.errorMessage = undefined;
  }

  private playerMove(i: number, symbol?: 'X' | 'O') {
    if (this.state === 'SETUP' || this.stateEnds() || this.context.board[i] !== null) return;

    let player: 'X' | 'O';
    
    if (this.context.mode === 'wild' && symbol) {
      // In wild mode, use the provided symbol
      player = symbol;
    } else {
      // In standard mode, use current turn's symbol
      player = this.state === 'X_TURN' ? 'X' : 'O';
    }

    this.context.board[i] = player;
    this.updateStateAfterMove(player);
    this.maybeAutoMove();
  }

  private maybeAutoMove() {
    const computerPlaysX = this.context.players.player1.type === 'computer';
    const computerPlaysO = this.context.players.player2.type === 'computer';
    
    if (
      (this.state === 'X_TURN' && computerPlaysX) ||
      (this.state === 'O_TURN' && computerPlaysO)
    ) {
      this.state = 'AI_THINKING';
      this.notifyStateChange();
      
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
        this.notifyStateChange();
      }, 1500);
    }
  }

  private wasXTurn(): boolean {
    // Helper to determine if we were in X's turn before AI_THINKING
    // We can infer this from the current board state and player configuration
    const computerPlaysX = this.context.players.player1.type === 'computer';
    const computerPlaysO = this.context.players.player2.type === 'computer';
    const moveCount = this.context.board.filter(cell => cell !== null).length;
    
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
    const move = getAIMove(this.context.board, this.context.mode, currentSymbol);
    return {
      index: move.index,
      symbol: move.symbol as 'X' | 'O' | undefined
    };
  }

  private updateStateAfterMove(_p: 'X' | 'O') {
    const winner = calculateWinner(this.context.board);
    if (winner) {
      this.state = winner === 'X' ? 'X_WIN' : 'O_WIN';
    } else if (isBoardFull(this.context.board)) {
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
    this.context.board.fill(null);
    this.maybeAutoMove();
  }

  private stateEnds() {
    return this.state === 'X_WIN' || this.state === 'O_WIN' || this.state === 'DRAW';
  }
}