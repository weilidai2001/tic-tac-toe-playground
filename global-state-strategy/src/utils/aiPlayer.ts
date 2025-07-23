import { SquareValue, GameMode } from '../types';
import { findWinningMove, findBlockingMove, getEmptySquares } from '@tic-tac-toe/views';

export function getAIMove(board: SquareValue[], mode: GameMode): { index: number; symbol?: SquareValue } {
  const emptySquares = getEmptySquares(board);
  
  if (emptySquares.length === 0) {
    throw new Error('No empty squares available');
  }

  if (mode === 'standard') {
    // In standard mode, AI plays as O
    const aiSymbol: SquareValue = 'O';
    const opponentSymbol: SquareValue = 'X';

    // 1. Try to win
    const winningMove = findWinningMove(board, aiSymbol);
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