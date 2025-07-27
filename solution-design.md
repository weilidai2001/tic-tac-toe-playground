# Technical Design Document: Tic Tac Toe Game Engine

## Executive Summary

This document presents the technical design for a client-side tic-tac-toe web application supporting both Standard and Wild game variants. The solution employs a Finite State Machine architecture within a GameEngine module to ensure clean separation of concerns and maintainable code. Key design decisions include using React with TypeScript, implementing a strategic AI with minimax algorithm, and maintaining UI-agnostic game logic for maximum flexibility.

**Estimated Implementation Time**: 10 hours

**Primary Architecture**: Finite State Machine with GameEngine encapsulation

**Technology Stack**: React, TypeScript, Jest for testing

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
- Basic AI competence with ability to recognise and play winning moves

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
│  │   Game Configuration│  │      Game State              │      │
│  │  • mode: GameMode   │  │  • board: Cell[][]           │      │
│  │  • player1Type      │  │  • currentPlayer: Player     │      │
│  │  • player2Type      │  │  • previousPlayer: Player    │      │
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

## Testing Strategy

### Testing Approach

The testing strategy will focus on ensuring reliability, correctness, and maintainability across all critical components of the tic-tac-toe application.

### Test Categories

#### 1. Unit Tests
**Target Coverage**: 95%+ for core game logic

**Critical Areas**:
- **Game Rules Logic**: Win condition detection, move validation, game state transitions
- **AI Strategy Functions**: Move evaluation, minimax algorithm, symbol selection in wild mode
- **GameEngine Interface**: Action processing, state queries, error handling
- **Finite State Machine**: State transitions, guard conditions, action execution

**Testing Framework**: Jest with TypeScript support

**Example Test Cases**:
```typescript
describe('GameEngine', () => {
  it('should detect horizontal wins correctly', () => {
    // Test all horizontal win combinations
  });
  
  it('should prevent invalid moves', () => {
    // Test occupied cells, out-of-bounds moves
  });
  
  it('should handle wild mode symbol selection', () => {
    // Test AI symbol choice logic
  });
});
```

#### 2. Integration Tests
**Focus**: Component interaction and data flow

**Key Scenarios**:
- Complete game flows (human vs human, human vs AI)
- Mode switching (standard ↔ wild)
- Error propagation and recovery
- AI decision-making in different board states

#### 3. End-to-End Tests
**Framework**: Cypress or Playwright

**User Journey Coverage**:
- Complete game sessions in both modes
- AI behavior validation
- UI responsiveness and accessibility
- Game reset and restart functionality

### Test Data Management

**Board State Fixtures**: Pre-defined board configurations for consistent testing
- Near-win scenarios
- Complex wild mode situations
- Edge cases (full board, immediate wins)

**AI Test Scenarios**: Standardised positions to validate AI decision-making
- Obvious winning moves
- Blocking opponent wins
- Strategic positioning in wild mode

### Performance Testing

**Benchmarks**:
- AI move calculation time: < 100ms for standard mode, < 200ms for wild mode
- Game state updates: < 16ms (60 FPS compliance)
- Memory usage: Monitor for leaks during extended play

### Testing Priority Matrix

| Component | Unit Tests | Integration | E2E | Priority |
|-----------|------------|-------------|-----|----------|
| Game Logic | ✓ | ✓ | ✓ | Critical |
| AI Strategy | ✓ | ✓ | ✓ | Critical |
| GameEngine | ✓ | ✓ | ✓ | Critical |
| UI Components | ✓ | ✓ | ✓ | High |
| State Management | ✓ | ✓ | - | High |

## Risks and Mitigation Strategies

### Technical Risks

#### 1. AI Performance in Wild Mode
**Risk**: Complex symbol selection logic may cause unacceptable delays

**Likelihood**: Medium | **Impact**: High

**Mitigation**:
- Implement time-bounded search with fallback to heuristic moves
- Cache evaluated positions to avoid recalculation
- Progressive enhancement: start with simple heuristics, optimise iteratively

#### 2. State Management Complexity
**Risk**: FSM implementation may become overly complex for simple game

**Likelihood**: Low | **Impact**: Medium

**Mitigation**:
- Start with minimal state machine, expand only as needed
- Fallback plan: Use simpler state management (Zustand) if FSM proves excessive
- Clear documentation of state transitions

#### 3. Cross-Browser Compatibility
**Risk**: Modern JavaScript features may not work in older browsers

**Likelihood**: Low | **Impact**: Low

**Mitigation**:
- Use TypeScript compilation targets for broader support
- Test on major browsers during development
- Polyfills for essential features if needed

### Implementation Risks

#### 1. Scope Creep
**Risk**: Feature additions beyond requirements within 10-hour constraint

**Likelihood**: Medium | **Impact**: High

**Mitigation**:
- Strict adherence to MVP requirements
- Time-boxed implementation phases
- Clear definition of "done" for each component

#### 2. Over-Engineering
**Risk**: Complex architecture may exceed time budget

**Likelihood**: Medium | **Impact**: High

**Mitigation**:
- Iterative implementation: start simple, refactor as needed
- Regular time tracking and scope adjustment
- Focus on working software over perfect architecture

### Quality Risks

#### 1. Insufficient Testing Coverage
**Risk**: Critical bugs in game logic or AI behavior

**Likelihood**: Medium | **Impact**: High

**Mitigation**:
- Test-driven development for critical components
- Automated test runs in development workflow
- Manual testing checklist for game scenarios

#### 2. Poor User Experience
**Risk**: Confusing interface or slow AI response

**Likelihood**: Low | **Impact**: Medium

**Mitigation**:
- Simple, intuitive UI design
- Loading indicators for AI moves
- Clear game state communication

## Use of AI

### LLM Usage Disclosure

**Tools Used**: ChatGPT-4 and Claude for various aspects of this technical design document.

**Specific Use Cases**:

1. **Document Structure and Writing Quality**
   - Used ChatGPT to rephrase draft sections for clarity and professional tone
   - Generated the ASCII architectural diagram for GameEngine structure
   - Improved technical vocabulary and document flow

2. **Research and Analysis**
   - Used Claude to explore architectural patterns and their trade-offs
   - Generated comparative analysis of different state management approaches
   - Researched best practices for AI implementation in turn-based games

3. **Technical Content Generation**
   - AI-assisted creation of testing strategy framework
   - Risk assessment methodology and mitigation strategies
   - Performance benchmarking criteria

**Prompts Used** (examples):
- "Compare finite state machines vs Redux for turn-based game state management"
- "Generate a comprehensive testing strategy for a React TypeScript tic-tac-toe game"
- "Create a risk assessment matrix for a 10-hour game development project"

**Human Oversight**: All AI-generated content was reviewed, validated, and customised to fit the specific requirements of this tic-tac-toe implementation. Technical decisions and architectural choices represent my own engineering judgment informed by AI research.
