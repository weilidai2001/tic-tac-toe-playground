import { GameSetup } from './GameSetup';
import { GamePlay } from './GamePlay';
import { GameStateAdapter } from '../types/gameAdapter';

interface AppProps {
  adapter: GameStateAdapter;
}

export function App({ adapter }: AppProps) {
  const { gameState, actions } = adapter;

  return (
    <div className="app">
      <header>
        <h1>Tic-Tac-Toe</h1>
        <div className="game-mode-indicator">
          Mode: {adapter.getModeConfig().displayName}
        </div>
      </header>

      <main>
        {gameState.isSetup ? (
          <GameSetup
            modeConfig={adapter.getModeConfig()}
            player1Type={gameState.players.player1.type}
            player2Type={gameState.players.player2.type}
            onModeChange={actions.onModeChange}
            onPlayerTypeChange={actions.onPlayerTypeChange}
            onStartGame={actions.onStartGame}
          />
        ) : (
          <GamePlay adapter={adapter} />
        )}
      </main>
    </div>
  );
}