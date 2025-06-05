import React from 'react';
import { createRoot } from 'react-dom/client';
import { FittingProvider } from './context/FittingProvider';
import { FittingEditor } from './components/FittingEditor';

import './index.css';

export const App = () => {
  return (
    <FittingProvider>
      <div className="App">
        <h1>EveHelper</h1>
        <FittingEditor />
      </div>
    </FittingProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} 