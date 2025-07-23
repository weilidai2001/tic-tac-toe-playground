# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a tic-tac-toe playground repository currently containing architectural documentation. The project is in its planning phase with no implemented code yet.

## Repository Structure

- `README.md` - Basic project description
- `architecture-discussion.md` - Comprehensive architectural analysis exploring different approaches for implementing a tic-tac-toe game, including:
  - Monolithic approach
  - MVC/Lifted State
  - Global State Management
  - Event-Driven Architecture
  - Finite State Machine (FSM)
  - Other patterns (ECS, FRP, Actor Model)

## Development Commands

No build system or package manager is currently configured. The repository contains only documentation files.

## Architecture Guidance

The `architecture-discussion.md` file provides detailed analysis of architectural patterns suitable for this tic-tac-toe implementation. Key architectural approaches discussed:

1. **Recommended Approach**: Hybrid of Global State Management (or FSM) + Strategy pattern
   - Use central store/state machine for core state management
   - Strategy pattern for different game modes ("Standard" and "Wild")
   - Supports both Player-vs-Player and Player-vs-Computer gameplay

2. **Technology Considerations**: 
   - React + TypeScript as primary stack
   - State management options: Zustand, Redux, or XState for FSM
   - Event-driven architecture for maximum decoupling if needed

## Future Implementation

When implementing the game, refer to the architectural discussion for guidance on:
- Separating concerns (State, Logic, Rendering, Controller)
- Choosing appropriate patterns based on complexity requirements
- Structuring components for reusability and testability