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