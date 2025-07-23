import { SquareValue } from '../types';

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  disabled?: boolean;
}

export function Square({ value, onClick, disabled = false }: SquareProps) {
  return (
    <button 
      className={`square ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {value}
    </button>
  );
}