import { App as GenericApp } from '@tic-tac-toe/views';
import { useReduxAdapter } from '../adapters/reduxAdapter';

export function App() {
  const adapter = useReduxAdapter();
  return <GenericApp adapter={adapter} />;
}