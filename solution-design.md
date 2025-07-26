# Technical Design Document: Tic Tac Toe Game Engine

## Background & Requirements

### Project Overview

This document outlines the technical design for a client-side web application implementing both Standard and Wild Tic Tac Toe game variants. The application will be built using React and TypeScript, supporting both single-player (vs. AI) and two-player modes.

### Game Rules

- **Standard Tic Tac Toe**: Traditional game where Player 1 always places 'X' and Player 2 always places 'O'. First player to achieve three consecutive marks wins.
- **Wild Tic Tac Toe**: Each player can choose to place either 'X' or 'O' on their turn. First player to achieve three consecutive marks of either symbol wins.

### Technical Requirements

- Support for both standard and wild game modes
- Support for both human and AI players
- Support for both single player and two player modes
- 3x3 game board
- Basic AI competence with ability to recognize and play winning moves

### Technical Constraints

- Client-side web application using React with TypeScript
- No backend persistence required
- Performance: All game operations must complete within reasonable time for optimal user experience
- Browser Compatibility: Support for modern browsers

### Assumptions and Rationale

1. **State Management**: Game state will be managed locally without backend persistence - this simplifies the implementation and meets the requirements
2. **AI Complexity**: Basic AI is sufficient; perfect play is not required as per specifications
3. **Development Time**: Approximately 10 hours for implementation as stated in requirements
4. **UI Simplicity**: Focus on functionality over visual aesthetics given time constraints

## Problem Statement 1: Game Logic Management within GameEngine

### Problem

How to implement the game rules logic module inside the GameEngine? What pattern should be used to manage game state transitions and rules?

### Background

The starting point for this project is the guiding principle that there would be strong separation of concerns. The UI should be decoupled from game logic, and most (if not all) of the components should be agnostic of the game mode (standard/wild) and player type (human/AI). In fact, UI should be so decoupled that React can easily be swapped out for a text-only console or even a chat interface.

Apart from the UI, the game logic and state should be encapsulated in this smart module called GameEngine. The GameEngine shall function almost like a webservice with interfaces which can receive POST requests to perform actions, and receive GET requests that shall return the updated game state. In this case, it's not a web service, but a module with interface that can receive Actions for possible state changing events, and read-only Queries for getting the current game state.

Inside the GameEngine it contains states and logic for the game, and logic for how to respond to actions when P1 or P2 is human or AI.
States have two layers, one is the game configuration such as game mode (standard/wild), player type (human/AI). The other is the game state, which includes the previous player (which we can infer the current player), the state of the board (from which we can infer whether the game has ended or who is the winner).

Game rules logic can be captured in a dedicated module. Two approaches were considered:

### Approaches for Problem Statement 1

#### Approach 1: Use Redux Store Inside GameEngine (Not Chosen)

Use a store like Redux or Zustand to capture the game rules logic.

I worked with a similar project before to build a rock-paper-scissors game, and I used Redux. I found Redux very easy to work with as I was already familiar with it as a Frontend developer. It was also easy to extend. But I have to admit there's lots of boiler plate code to write. And at the time the convention was to spread the store and reducers in different locations, so making sure all the functions hooked up was a bit tedious. Also considering Redux is quite coupled with React, it doesn't satisfy my self-imposed requirement of agnostic of UI implementation.

**Strengths**:

- Well-established pattern in React ecosystem
- Excellent debugging tools
- Clear separation of concerns
- Easy to extend

**Limitations**:

- Significant boilerplate code
- Tight coupling with React ecosystem
- Functions spread across different locations
- Not UI-agnostic

#### Approach 2: Finite State Machine (Chosen)

Use a Finite State Machine to capture the game rules logic. This approach is matching with the turn-based nature of the game. The whole game can be modelled as a simple state machine with a few states - Initialising, Player1Turn, Player2Turn, GameOver. The game will transition between these states based on the actions received and the current state of the game. For example, when the game is in Player1Turn state, it will transition to Player2Turn state if currently the game is not over when P1 makes a move, and transition to GameOver state when P1 makes a move and the board is in game over state.

To be honest, both approaches are pretty similar, as they all lead to actions and conditions changing state. But I favour the Finite State Machine approach, as it is more agnostic of the UI implementation where Redux store would need the UI layer to setup Redux provider, and UI not readily swap outable with console.

**Decision**: Chosen for its UI-agnostic nature and natural fit with turn-based game logic.

### GameEngine Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                              UI Layer                             │
│                    (React / Console / Chat)                       │
└────────────────────────────┬──────────────────────────────┬───────┘
                             │                              │
                    Actions  │                              │ Queries
                             ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           GameEngine                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Public Interface                     │    │
│  │  • executeAction(action: GameAction): GameState         │    │
│  │  • getState(): GameState                                │    │
│  │  • isValidMove(position: Position): boolean             │    │
│  │  • getWinner(): Player | null                           │    │
│  │  • isGameOver(): boolean                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────┐      │
│  │   Game Configuration │  │      Game State             │      │
│  │  • mode: GameMode    │  │  • board: Cell[][]          │      │
│  │  • player1Type       │  │  • currentPlayer: Player    │      │
│  │  • player2Type       │  │  • previousPlayer: Player   │      │
│  └─────────────────────┘  │  • status: GameStatus        │      │
│                           │  • moveHistory: Move[]       │      │
│                           └──────────────────────────────┘      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Finite State Machine                       │    │
│  │  ┌───────┐  BEGIN   ┌────────────┐  P1DONE   ┌────────┐ │    │
│  │  │ Start │ ────────▶│ P1Thinking │ ────────▶ │  P2    │ │    │
│  │  └───────┘          └────────────┘           │Thinking│ │    │
│  │                            │                 └────┬───┘ │    │
│  │                            │                      │     │    │
│  │                            │ P1DONE               │     │    │
│  │                            │ (game ended)  P2DONE │     │    │
│  │                            ▼                      │     │    │
│  │                     ┌─────────────┐               │     │    │
│  │                     │ GameFinish  │◀──────────────┘     │    │
│  │                     └─────────────┘   (game ended)      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Helper Functions                           │    │
│  │  • checkWinCondition(board): boolean                    │    │
│  │  • getValidMoves(board): Position[]                     │    │
│  │  • evaluateBoard(board): number                         │    │
│  │  • getAIMove(state, symbol): Position                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   AI Strategy Module                    │    │
│  │  • findWinningMove(state): Move | null                  │    │
│  │  • findBlockingMove(state): Move | null                 │    │
│  │  • minimax(state): Move                                 │    │
│  │  • getSymbolForWildMode(state): Symbol                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

The GameEngine encapsulates all game logic and provides a clean interface that functions like a web service - accepting Actions (like POST requests) and responding to Queries (like GET requests). The Finite State Machine manages the game flow transitions, while helper functions and the AI module handle the game rules and intelligent play.

Anyway, it doesn't matter which approach is used, there needs to be some common helper functions to handle the game rules logic, such as checking if a move is valid, checking if the game is over, etc. And one complex helper function in particular is for the AI to decide what move to make based on the current game state.

## Problem Statement 2: AI Player Implementation

### Problem

How to implement an AI player that can play competently in both Standard and Wild game modes, with particular consideration for the symbol selection in Wild mode?

### Approaches for Problem Statement 2

So there can be several approaches for the AI Move function, and in particular when the game is in Wild mode, the AI needs to make a further decision on what symbol to use.

#### Standard Mode AI Approaches

Let's start with the standard mode in the order of increasing intelligence (i.e. AI more likely to win):

**Approach 1 - Simple Random Move**
Chooses an empty square at random.

**Approach 2 - Biased Random Move**
Simple Random Move that chooses an empty square at random, but with a small bias towards the center square, then corner squares, then edge squares.

**Approach 3 - Strategic Move with Basic Rules**
Consider the opponent's status, for the next move, favour a move that can win the game, then block the opponent from winning the game, then take the center square, then corner squares, then edge squares.

**Approach 4 - Exhaustive Search with Minimax (Chosen)**
Exhaustive search to find the best move based on the current game state. Using Minimax there should be a maximum of 9! = 362880 possible moves to consider. But assuming when AI goes first, it will always take the centre, then the human uses another space, the next time the AI move it would be "only" 7! = 5040 possible moves to consider, which is well within the limit of a modern computer. If human goes first, then the AI would have 8! = 40320 possible moves to consider, which is still well within the limit of a modern computer.

#### Wild Mode AI Approaches

Now let's consider the Wild mode. The AI needs to make a further decision on what symbol to use.

**Approach 1 - Random Symbol and Move**
Randomly choose symbol and Simple Random Move that chooses an empty square at random.

**Approach 2 - Random Symbol with Biased Move**
Randomly choose symbol and Simple Random Move that chooses an empty square at random, but with a small bias towards the center square, then corner squares, then edge squares.

**Approach 3 - Strategic Symbol Selection (Chosen)**
Choose symbol based on the opponent's status, for the next move, favour a move that can win the game, then block the opponent from winning the game, then take the center square, then corner squares, then edge squares.

**Approach 4 - Exhaustive Search for Symbol and Move**
Choose symbol and a move using minimax algorithm. Max computation is 2 \* 8! = 103680 possible moves to consider.

### Implementation Details

The AI implementation will use Approach 3 for quick decisions and fall back to Approach 4 (minimax) for more complex board states. The minimax approach is feasible given the computational limits calculated above.
