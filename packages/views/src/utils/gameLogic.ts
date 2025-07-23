import { SquareValue } from '../types';

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

export function calculateWinner(board: SquareValue[]): SquareValue | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function isBoardFull(board: SquareValue[]): boolean {
  return board.every(square => square !== null);
}

export function getEmptySquares(board: SquareValue[]): number[] {
  return board.map((square, index) => square === null ? index : null)
              .filter((val): val is number => val !== null);
}

export function findWinningMove(board: SquareValue[], symbol: SquareValue): number | null {
  const emptySquares = getEmptySquares(board);
  
  for (const index of emptySquares) {
    const testBoard = [...board];
    testBoard[index] = symbol;
    if (calculateWinner(testBoard) === symbol) {
      return index;
    }
  }
  
  return null;
}

export function findBlockingMove(board: SquareValue[], opponentSymbol: SquareValue): number | null {
  return findWinningMove(board, opponentSymbol);
}

export function getAIMove(board: SquareValue[], mode: 'standard' | 'wild', aiSymbol?: SquareValue): { index: number; symbol?: SquareValue } {
  const emptySquares = getEmptySquares(board);
  
  if (emptySquares.length === 0) {
    throw new Error('No empty squares available');
  }

  if (mode === 'standard') {
    // In standard mode, AI uses the provided symbol (typically 'O')
    const symbol = aiSymbol || 'O';
    const opponentSymbol: SquareValue = symbol === 'X' ? 'O' : 'X';

    // 1. Try to win
    const winningMove = findWinningMove(board, symbol);
    if (winningMove !== null) {
      return { index: winningMove };
    }

    // 2. Try to block opponent from winning
    const blockingMove = findBlockingMove(board, opponentSymbol);
    if (blockingMove !== null) {
      return { index: blockingMove };
    }

    // 3. Take center if available
    if (board[4] === null) {
      return { index: 4 };
    }

    // 4. Take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => board[corner] === null);
    if (availableCorners.length > 0) {
      const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
      return { index: randomCorner };
    }

    // 5. Take any available square
    const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    return { index: randomSquare };
  } else {
    // Wild mode - AI can choose any symbol
    const symbols: SquareValue[] = ['X', 'O'];
    
    // Try to win with either symbol
    for (const symbol of symbols) {
      const winningMove = findWinningMove(board, symbol);
      if (winningMove !== null) {
        return { index: winningMove, symbol };
      }
    }

    // Try to block opponent from winning with either symbol
    for (const symbol of symbols) {
      const blockingMove = findBlockingMove(board, symbol);
      if (blockingMove !== null) {
        // Use the opposite symbol to block
        const blockingSymbol = symbol === 'X' ? 'O' : 'X';
        return { index: blockingMove, symbol: blockingSymbol };
      }
    }

    // Choose a random move with a random symbol
    const randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return { index: randomSquare, symbol: randomSymbol };
  }
}