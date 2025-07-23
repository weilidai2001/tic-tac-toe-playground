import { GameMode, PlayerType } from '../types';

interface GameSetupProps {
  mode: GameMode;
  player1Type: PlayerType;
  player2Type: PlayerType;
  onModeChange: (mode: GameMode) => void;
  onPlayerTypeChange: (playerId: 'player1' | 'player2', type: PlayerType) => void;
  onStartGame: () => void;
}

export function GameSetup({
  mode,
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
          <label>
            <input
              type="radio"
              value="standard"
              checked={mode === 'standard'}
              onChange={(e) => onModeChange(e.target.value as GameMode)}
            />
            Standard (X vs O)
          </label>
          <label>
            <input
              type="radio"
              value="wild"
              checked={mode === 'wild'}
              onChange={(e) => onModeChange(e.target.value as GameMode)}
            />
            Wild (Choose X or O each turn)
          </label>
        </div>
      </div>

      <div className="setup-section">
        <h3>Players</h3>
        <div className="player-setup">
          <div className="player-config">
            <h4>Player 1 {mode === 'standard' ? '(X)' : ''}</h4>
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
            <h4>Player 2 {mode === 'standard' ? '(O)' : ''}</h4>
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