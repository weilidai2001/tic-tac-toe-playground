import { GameMode, PlayerType, ModeConfig } from '../types';
import { modeConfigs } from '../config/modeConfigs';

interface GameSetupProps {
  modeConfig: ModeConfig;
  player1Type: PlayerType;
  player2Type: PlayerType;
  onModeChange: (mode: GameMode) => void;
  onPlayerTypeChange: (playerId: 'player1' | 'player2', type: PlayerType) => void;
  onStartGame: () => void;
}

export function GameSetup({
  modeConfig,
  player1Type,
  player2Type,
  onModeChange,
  onPlayerTypeChange,
  onStartGame
}: GameSetupProps) {
  return (
    <div className="game-setup">
      <h2>Game Setup</h2>
      
      <div className="setup-section">
        <h3>Game Mode</h3>
        <div className="mode-selector">
          {Object.values(modeConfigs).map((config) => (
            <label key={config.id}>
              <input
                type="radio"
                value={config.id}
                checked={modeConfig.id === config.id}
                onChange={(e) => onModeChange(e.target.value as GameMode)}
              />
              {config.displayName} ({config.description})
            </label>
          ))}
        </div>
      </div>

      <div className="setup-section">
        <h3>Players</h3>
        <div className="player-setup">
          <div className="player-config">
            <h4>{modeConfig.getPlayerLabel('player1')}</h4>
            <label>
              <input
                type="radio"
                value="human"
                checked={player1Type === 'human'}
                onChange={(e) => onPlayerTypeChange('player1', e.target.value as PlayerType)}
              />
              Human
            </label>
            <label>
              <input
                type="radio"
                value="computer"
                checked={player1Type === 'computer'}
                onChange={(e) => onPlayerTypeChange('player1', e.target.value as PlayerType)}
              />
              Computer
            </label>
          </div>

          <div className="player-config">
            <h4>{modeConfig.getPlayerLabel('player2')}</h4>
            <label>
              <input
                type="radio"
                value="human"
                checked={player2Type === 'human'}
                onChange={(e) => onPlayerTypeChange('player2', e.target.value as PlayerType)}
              />
              Human
            </label>
            <label>
              <input
                type="radio"
                value="computer"
                checked={player2Type === 'computer'}
                onChange={(e) => onPlayerTypeChange('player2', e.target.value as PlayerType)}
              />
              Computer
            </label>
          </div>
        </div>
      </div>

      <button className="start-game-btn" onClick={onStartGame}>
        Start Game
      </button>
    </div>
  );
}