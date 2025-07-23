import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, GameMode, PlayerType, SquareValue } from '../types';
import { isBoardFull, createGameStrategy } from '@tic-tac-toe/views';
import { getAIMove } from '../utils/aiPlayer';

const initialState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: {
    id: 'player1',
    type: 'human',
    symbol: 'X'
  },
  winner: null,
  mode: 'standard',
  players: {
    player1: { id: 'player1', type: 'human', symbol: 'X' },
    player2: { id: 'player2', type: 'human', symbol: 'O' }
  },
  isSetup: true,
  errorMessage: undefined
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<GameMode>) => {
      state.mode = action.payload;
      // Reset player symbols based on mode
      if (action.payload === 'standard') {
        state.players.player1.symbol = 'X';
        state.players.player2.symbol = 'O';
      } else {
        // In wild mode, players don't have fixed symbols
        state.players.player1.symbol = undefined;
        state.players.player2.symbol = undefined;
      }
    },
    
    setPlayerType: (state, action: PayloadAction<{ playerId: 'player1' | 'player2'; playerType: PlayerType }>) => {
      state.players[action.payload.playerId].type = action.payload.playerType;
    },
    
    startGame: (state) => {
      state.isSetup = false;
      state.board = Array(9).fill(null);
      state.winner = null;
      state.currentPlayer = state.players.player1;
    },
    
    makeMove: (state, action: PayloadAction<{ index: number; symbol?: SquareValue }>) => {
      const { index, symbol } = action.payload;
      const strategy = createGameStrategy(state.mode);
      
      // Validate move
      if (!strategy.isMoveValid(state.board, index)) {
        return;
      }
      
      // Determine symbol to place
      let symbolToPlace: SquareValue;
      if (state.mode === 'standard') {
        symbolToPlace = state.currentPlayer.symbol!;
      } else {
        // Wild mode - symbol must be provided
        if (!symbol) return;
        symbolToPlace = symbol;
      }
      
      // Make the move
      state.board[index] = symbolToPlace;
      
      // Check for winner
      const winner = strategy.checkWinner(state.board);
      if (winner) {
        state.winner = winner;
        return;
      }
      
      // Check for draw
      if (isBoardFull(state.board)) {
        state.winner = 'draw';
        return;
      }
      
      // Switch to next player
      state.currentPlayer = state.currentPlayer.id === 'player1' 
        ? state.players.player2 
        : state.players.player1;
    },
    
    resetGame: (state) => {
      state.board = Array(9).fill(null);
      state.winner = null;
      state.currentPlayer = state.players.player1;
    },
    
    resetToSetup: (state) => {
      Object.assign(state, initialState);
    },
    
    makeAIMove: (state) => {
      if (state.currentPlayer.type !== 'computer') return;
      
      try {
        const aiMove = getAIMove(state.board, state.mode);
        const strategy = createGameStrategy(state.mode);
        
        // Validate move
        if (!strategy.isMoveValid(state.board, aiMove.index)) {
          return;
        }
        
        // Determine symbol to place
        let symbolToPlace: SquareValue;
        if (state.mode === 'standard') {
          symbolToPlace = state.currentPlayer.symbol!;
        } else {
          symbolToPlace = aiMove.symbol!;
        }
        
        // Make the move
        state.board[aiMove.index] = symbolToPlace;
        
        // Check for winner
        const winner = strategy.checkWinner(state.board);
        if (winner) {
          state.winner = winner;
          return;
        }
        
        // Check for draw
        if (isBoardFull(state.board)) {
          state.winner = 'draw';
          return;
        }
        
        // Switch to next player
        state.currentPlayer = state.currentPlayer.id === 'player1' 
          ? state.players.player2 
          : state.players.player1;
      } catch (error) {
        console.error('AI move failed:', error);
      }
    },

    setError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },

    clearError: (state) => {
      state.errorMessage = undefined;
    }
  }
});

export const { 
  setMode, 
  setPlayerType, 
  startGame, 
  makeMove, 
  resetGame, 
  resetToSetup,
  makeAIMove,
  setError,
  clearError
} = gameSlice.actions;

export default gameSlice.reducer;