import React, { useState, useEffect } from 'react';
import './App.css';
import Fitting from './Fitting';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sdeStatus, setSdeStatus] = useState('idle'); // idle, downloading, verifying, extracting, importing, complete, error
  const [sdeProgress, setSdeProgress] = useState(0);

  useEffect(() => {
    window.electron.on('login-success', () => {
      setIsLoggedIn(true);
    });

    // Check initial login state
    window.electron.send('check-login-status');
    window.electron.on('login-status', (status) => {
      setIsLoggedIn(status);
    });

    window.electron.on('sde-progress', ({ status, progress }) => {
      setSdeStatus(status);
      if (progress) {
        setSdeProgress(progress);
      }
    });

    window.electron.on('sde-download-complete', () => {
      setSdeStatus('complete');
    });

    window.electron.on('sde-download-error', (errorMessage) => {
      console.error('SDE Download Error:', errorMessage);
      setSdeStatus('error');
    });
  }, []);

  const handleLogin = () => {
    // This will trigger the OAuth flow in the main process
    window.electron.send('login');
  };

  const handleSdeDownload = () => {
    setSdeStatus('downloading');
    window.electron.send('download-sde');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>EveHelper</h1>
        {!isLoggedIn && (
          <button onClick={handleLogin}>Login with EVE Online</button>
        )}
      </header>
      <main className="app-main">
        {isLoggedIn ? (
          <div>
            <div className="sde-controls">
              <button onClick={handleSdeDownload} disabled={sdeStatus !== 'idle' && sdeStatus !== 'complete' && sdeStatus !== 'error'}>
                {sdeStatus === 'idle' || sdeStatus === 'complete' || sdeStatus === 'error' ? 'Download SDE' : `SDE: ${sdeStatus}...`}
              </button>
              {sdeStatus === 'downloading' && <progress value={sdeProgress} max="100" />}
              {sdeStatus === 'complete' && <p>SDE Download Complete!</p>}
              {sdeStatus === 'error' && <p>SDE Download Failed. Check console.</p>}
            </div>
            <Fitting />
          </div>
        ) : (
          <p>Please log in to see the fitting editor.</p>
        )}
      </main>
    </div>
  );
};

export default App; 