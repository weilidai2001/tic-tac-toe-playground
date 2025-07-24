import { useState } from "react";
import { StateMachine } from "../machines/gameMachine";
import {
  GameStateAdapter,
  SquareValue,
  GameMode,
  PlayerType,
} from "@tic-tac-toe/views";

class FSMAdapter extends GameStateAdapter {
  // No additional methods needed - all shared logic is in the base class
}

type Player = "P1" | "P2";

type Symbol = "X" | "O";
type Cell = Symbol | undefined;
type GameMode = "standard" | "wild";
type GameState = "start" | "P1Thinking" | "P2Thinking" | "GameFinish";
type GameEvent = "BEGIN" | "P1DONE" | "P2DONE";

class Board {
  private grid: Cell[] = Array(9).fill(undefined) as Cell[];

  isGameEnded(): boolean {
    return this.grid.every((cell) => cell !== undefined);
  }

  place(location: number, symbol: Symbol) {
    if (location < 0 || location > 8 || this.grid[location] !== undefined) {
      throw new Error("Invalid location");
    }
    this.grid[location] = symbol;
  }
}

function getAiMove(board: Board, nextSymbol: Symbol): number {}

function getSymbol(player: Player, gameMode: GameMode): Symbol {}

function move(
  isPlayer1Ai: boolean,
  isPlayer2Ai: boolean,
  board: Board,
  previousMoveMaker: Player | undefined,
  symbol: Symbol,
  location: number,
  stateMachine: StateMachine<GameState, GameEvent>,
  gameMode: GameMode
) {
  const currentPlayer = previousMoveMaker === "P1" ? "P2" : "P1";
  board.place(location, symbol);
  if (currentPlayer === "P1") {
    stateMachine.dispatch("P1DONE");
    if (!board.isGameEnded() && isPlayer2Ai) {
      const nextSymbol = getSymbol(currentPlayer, gameMode);
      const aiMove = getAiMove(board, nextSymbol);
      move(
        isPlayer1Ai,
        isPlayer2Ai,
        board,
        currentPlayer,
        nextSymbol,
        aiMove,
        stateMachine,
        gameMode
      );
    }
  } else if (currentPlayer === "P2") {
    stateMachine.dispatch("P2DONE");
    if (!board.isGameEnded() && isPlayer1Ai) {
      const nextSymbol = getSymbol(currentPlayer, gameMode);
      const aiMove = getAiMove(board, nextSymbol);
      move(
        isPlayer1Ai,
        isPlayer2Ai,
        board,
        currentPlayer,
        nextSymbol,
        aiMove,
        stateMachine,
        gameMode
      );
    }
  }
}

export function useXStateAdapter(): GameStateAdapter {
  const [previousMoveMaker, setPreviousMoveMaker] = useState<
    Player | undefined
  >(undefined);
  const [board, setBoard] = useState(() => new Board());
  const [isPlayer1Ai, setIsPlayer1Ai] = useState(false);
  const [isPlayer2Ai, setIsPlayer2Ai] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("standard");

  const [fsm] = useState(
    () =>
      new StateMachine("start", [
        { from: "start", to: "P1Thinking", on: "BEGIN" },

        {
          from: "P1Thinking",
          to: "GameFinish",
          on: "P1DONE",
          guard: () => board.isGameEnded(),
        },
        {
          from: "P1Thinking",
          to: "P2Thinking",
          on: "P1DONE",
          guard: () => !board.isGameEnded(),
        },

        {
          from: "P2Thinking",
          to: "GameFinish",
          on: "P2DONE",
          guard: () => board.isGameEnded(),
        },
        {
          from: "P2Thinking",
          to: "P1Thinking",
          on: "P2DONE",
          guard: () => !board.isGameEnded(),
        },
      ])
  );
  const [selectedSymbol, setSelectedSymbol] = useState<SquareValue | null>(
    null
  );

  const actions = {
    onModeChange: (mode: GameMode) => {
      setGameMode(mode);
    },
    onPlayerTypeChange: (
      playerId: "player1" | "player2",
      playerType: PlayerType
    ) => {
      if (playerId === "player1") {
        setIsPlayer1Ai(playerType === "computer");
      } else {
        setIsPlayer2Ai(playerType === "computer");
      }
    },
    onStartGame: () => {
      fsm.dispatch("BEGIN");
      if (isPlayer1Ai) {
        move(
          isPlayer1Ai,
          isPlayer2Ai,
          board,
          previousMoveMaker,
          "X",
          0,
          fsm,
          gameMode
        );
      }
    },
    onSquareClick: (index: number, symbol?: SquareValue) => {
      const currentPlayer = previousMoveMaker === "P1" ? "P2" : "P1";
      const nextSymbol = symbol ? symbol : getSymbol(currentPlayer, gameMode);
      move(
        isPlayer1Ai,
        isPlayer2Ai,
        board,
        previousMoveMaker,
        nextSymbol,
        index,
        fsm,
        gameMode
      );
    },
    onResetGame: () => {
      fsm.dispatch("RESET");
    },
    onResetToSetup: () => {
      fsm.dispatch("RESET_TO_SETUP");
    },
    onClearError: () => {
      fsm.dispatch("CLEAR_ERROR");
    },
    onSetError: (message: string) => {
      fsm.dispatch("SET_ERROR", message);
    },
  };

  return new FSMAdapter(gameState, actions, selectedSymbol, setSelectedSymbol);
}
