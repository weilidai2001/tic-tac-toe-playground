import { Square } from './Square';
import { SquareValue } from '../types';

interface BoardProps {
  board: SquareValue[];
  onSquareClick: (index: number) => void;
  disabled?: boolean;
}

export function Board({ board, onSquareClick, disabled = false }: BoardProps) {
  return (
    <div className="board">
      {board.map((square, index) => (
        <Square
          key={index}
          value={square}
          onClick={() => onSquareClick(index)}
          disabled={disabled || square !== null}
        />
      ))}
    </div>
  );
}