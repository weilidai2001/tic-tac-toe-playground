This is a technical design document for a tic-tac-toe game engine supporting both standard and wild game modes, with human and AI players.

## Background & Requirements

The game engine should support the following features:

- Support for both standard and wild game modes
- Support for both human and AI players
- Support for both single player and two player modes

## Approaches

The starting point for this project is the guiding principle that there would be strong separation of concerns. The UI should be decoupled from game logic, and most (if not all) of the components should be agnostic of the game mode (standard/wild) and player type (human/AI). In fact, UI should be so decoupled that React can easily be swapped out for a text-only console or even a chat interface.
Apart from the UI, the game logic and state should be encapsulated in this smart module called GameEngine. The GameEngine shall function almost like a webservice with interfaces which can receive POST requests to perform actions, and receive GET requests that shall return the updated game state. In this case, it's not a web service, but a module with interface that can receive Actions for possible state changing events, and read-only Queries for getting the current game state.

Inside the GameEngine it contains states and logic for the game, and logic for how to respond to actions when P1 or P2 is human or AI.
States have two layers, one is the game configuration such as game mode (standard/wild), player type (human/AI). The other is the game state, which includes the previous player (which we can infer the current player), the state of the board (from which we can infer whether the game has ended or who is the winner).

Game rules logic can be captured in a dedicated module. Two approaches were considered:

1. Use a Finite State Machine to capture the game rules logic. This approach is matching with the turn-based nature of the game. The whole game can be modelled as a simple state machine with a few states - Initialising, Player1Turn, Player2Turn, GameOver. The game will transition between these states based on the actions received and the current state of the game. For example, when the game is in Player1Turn state, it will transition to Player2Turn state if currently the game is not over when P1 makes a move, and transition to GameOver state when P1 makes a move and the board is in game over state.
2. Use a store like Redux or Zustand to capture the game rules logic.

To be honest, both approaches are pretty similar, as they all lead to actions and conditions changing state. But I favour the Finite State Machine approach, as it is more agnostic of the UI implementation where Redux store would need the UI layer to setup Redux provider, and UI not readily swap outable with console.

Anyway, it doesn't matter which approach is used, there needs to be some common helper functions to handle the game rules logic, such as checking if a move is valid, checking if the game is over, etc. And one complex helper function in particular is for the AI to decide what move to make based on the current game state.

So there can be several approaches for the AI Move function, and in particular when the game is in Wild mode, the AI needs to make a further decision on what symbol to use.

Lets start with the standard mode in the order of increasing intelligence (i.e. AI more likely to win):
Approach 1 - Simple Random Move that chooses an empty square at random.
Approach 2 - Simple Random Move that chooses an empty square at random, but with a small bias towards the center square, then corner squares, then edge squares.
Approach 3 - Consider the opponent's status, for the next move, favour a move that can win the game, then block the opponent from winning the game, then take the center square, then corner squares, then edge squares.
Approach 4 - Exhaustive search to find the best move based on the current game state. Using Minmax there should be a maximum of 9! = 362880 possible moves to consider. But assuming when AI goes first, it will always take the centre, then the human uses another space, the next time the AI move it would be "only" 7! = 5040 possible moves to consider, which is well within the limit of a modern computer. If human goes first, then the AI would have 8! = 40320 possible moves to consider, which is still well within the limit of a modern computer.

Now let's consider the Wild mode. The AI needs to make a further decision on what symbol to use.
Approach 1 - Randomly choose symbol and Simple Random Move that chooses an empty square at random
Approach 2 - Randomly choose symbol and Simple Random Move that chooses an empty square at random, but with a small bias towards the center square, then corner squares, then edge squares.
Approach 3 - Choose symbol based on the opponent's status, for the next move, favour a move that can win the game, then block the opponent from winning the game, then take the center square, then corner squares, then edge squares.
Approach 4 - Choose symbol and a move using minmax algorithm. Max computation is 2 \* 8! = 103680 possible moves to consider.

### The approaches you considered for another relevant technical challenge, their strengths and limitations.

I worked with a similar project before to build a rock-paper-scissors game, and I used Redux. I found Redux very easy to work with as I was already familiar with it as a Frontend developer. It was also easy to extend. But I have to admit there's lots of boiler plate code to write. And at the time the convention was to spread the store and reducers in different locations, so making sure all the functions hooked up was a bit tedious. Also considering Redux is quite coupled with React, it doesn't satisfy my self-imposed requirement of agnostic of UI implementation.

# Risks and mitigation strategies.

# Testing strategy
