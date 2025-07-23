import { createMachine, assign } from 'xstate';
import { GameState, GameEvent, SquareValue } from '../types';
import { createGameStrategy, isBoardFull, getAIMove } from '@tic-tac-toe/views';

const initialContext: GameState = {
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
  errorMessage: undefined
};

function makeAIMove(context: GameState): { index: number; symbol: SquareValue } {
  const currentPlayer = context.currentPlayer;
  const aiSymbol = currentPlayer.symbol;
  
  const move = getAIMove(context.board, context.mode, aiSymbol);
  
  // For wild mode, ensure we return a symbol
  if (context.mode === 'wild' && !move.symbol) {
    const symbols: SquareValue[] = ['X', 'O'];
    move.symbol = symbols[Math.floor(Math.random() * symbols.length)];
  }
  
  return {
    index: move.index,
    symbol: move.symbol || aiSymbol || 'O'
  };
}

export const gameMachine = createMachine<GameState, GameEvent>({
  id: 'ticTacToe',
  initial: 'setup',
  context: initialContext,
  on: {
    SET_ERROR: {
      actions: assign({
        errorMessage: (_, event) => event.message
      })
    },
    CLEAR_ERROR: {
      actions: assign({
        errorMessage: () => undefined
      })
    }
  },
  states: {
    setup: {
      on: {
        SET_MODE: {
          actions: assign({
            mode: (_, event) => event.mode,
            // Reset symbols for wild mode
            players: (context, event) => event.mode === 'wild' ? {
              player1: { ...context.players.player1, symbol: undefined },
              player2: { ...context.players.player2, symbol: undefined }
            } : {
              player1: { ...context.players.player1, symbol: 'X' },
              player2: { ...context.players.player2, symbol: 'O' }
            },
            currentPlayer: (context, event) => ({
              ...context.currentPlayer,
              symbol: event.mode === 'wild' ? undefined : 'X'
            })
          })
        },
        SET_PLAYER_TYPE: {
          actions: assign({
            players: (context, event) => ({
              ...context.players,
              [event.playerId]: {
                ...context.players[event.playerId],
                type: event.playerType
              }
            })
          })
        },
        PLAY: {
          target: 'playing',
          actions: assign({
            board: Array(9).fill(null),
            currentPlayer: (context) => ({
              ...context.players.player1,
            }),
            winner: null
          })
        }
      }
    },
    playing: {
      always: [
        {
          target: 'gameOver',
          cond: (context) => {
            const strategy = createGameStrategy(context.mode);
            const winner = strategy.checkWinner(context.board);
            return winner !== null || isBoardFull(context.board);
          },
          actions: assign({
            winner: (context) => {
              const strategy = createGameStrategy(context.mode);
              const winner = strategy.checkWinner(context.board);
              return winner || (isBoardFull(context.board) ? 'draw' : null);
            }
          })
        },
        {
          target: 'aiTurn',
          cond: (context) => context.currentPlayer.type === 'computer'
        }
      ],
      on: {
        PLAY: {
          cond: (context, event) => {
            const strategy = createGameStrategy(context.mode);
            return strategy.isMoveValid(context.board, event.index) && 
                   context.currentPlayer.type === 'human';
          },
          actions: assign({
            board: (context, event) => {
              const newBoard = [...context.board];
              const symbol = event.symbol || 
                (context.mode === 'standard' ? context.currentPlayer.symbol! : 'X');
              newBoard[event.index] = symbol;
              return newBoard;
            },
            currentPlayer: (context) => 
              context.currentPlayer.id === 'player1' ? 
              context.players.player2 : context.players.player1
          })
        }
      }
    },
    aiTurn: {
      after: {
        500: {
          target: 'playing',
          actions: assign({
            board: (context) => {
              const { index, symbol } = makeAIMove(context);
              const newBoard = [...context.board];
              newBoard[index] = symbol;
              return newBoard;
            },
            currentPlayer: (context) => 
              context.currentPlayer.id === 'player1' ? 
              context.players.player2 : context.players.player1
          })
        }
      }
    },
    gameOver: {
      on: {
        RESET: {
          target: 'playing',
          actions: assign({
            board: Array(9).fill(null),
            currentPlayer: (context) => context.players.player1,
            winner: null
          })
        }
      }
    }
  }
});