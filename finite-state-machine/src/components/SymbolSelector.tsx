import React from 'react';
import { SquareValue } from '../types';

interface SymbolSelectorProps {
  availableSymbols: SquareValue[];
  selectedSymbol: SquareValue | null;
  onSymbolSelect: (symbol: SquareValue) => void;
  disabled?: boolean;
}

export function SymbolSelector({ 
  availableSymbols, 
  selectedSymbol, 
  onSymbolSelect, 
  disabled = false 
}: SymbolSelectorProps) {
  if (availableSymbols.length <= 1) {
    return null;
  }

  return (
    <div className="symbol-selector">
      <span className="selector-label">Choose symbol:</span>
      {availableSymbols.map((symbol) => (
        <button
          key={symbol}
          className={`symbol-button ${selectedSymbol === symbol ? 'selected' : ''}`}
          onClick={() => onSymbolSelect(symbol)}
          disabled={disabled}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
}