import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { Home, Ships, Fittings, Skills, Market, NotFound } from '../routes';
import { Layout } from './layout';
import { darkTheme } from '../theme';
import { ErrorBoundary } from './common';

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
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Router>
          <Layout isLoggedIn={isLoggedIn} onLogin={handleLogin}>
            {isLoggedIn ? (
              <>
                <div className="sde-controls">
                  <button onClick={handleSdeDownload} disabled={sdeStatus !== 'idle' && sdeStatus !== 'complete' && sdeStatus !== 'error'}>
                    {sdeStatus === 'idle' || sdeStatus === 'complete' || sdeStatus === 'error' ? 'Download SDE' : `SDE: ${sdeStatus}...`}
                  </button>
                  {sdeStatus === 'downloading' && <progress value={sdeProgress} max="100" />}
                  {sdeStatus === 'complete' && <p>SDE Download Complete!</p>}
                  {sdeStatus === 'error' && <p>SDE Download Failed. Check console.</p>}
                </div>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/ships" element={<Ships />} />
                  <Route path="/fittings" element={<Fittings />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            ) : (
              <p>Please log in to see the EVE Online data.</p>
            )}
          </Layout>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 