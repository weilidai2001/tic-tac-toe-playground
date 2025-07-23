import { App as GenericApp } from '@tic-tac-toe/views';
import { useXStateAdapter } from '../adapters/xstateAdapter';

export function App() {
  const adapter = useXStateAdapter();
  return <GenericApp adapter={adapter} />;
}