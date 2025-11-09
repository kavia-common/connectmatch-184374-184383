import React, { useState, useEffect } from 'react';
import './App.css';
import AppRouter from './routes/AppRouter';
import NavBar from './components/navigation/NavBar';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Apply theme to document element so CSS variables can react
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="op-app">
      <header className="op-header">
        <div className="op-brand">
          <div className="op-logo">🌊</div>
          <div className="op-brand-text">
            <span className="op-brand-title">ConnectMatch</span>
            <span className="op-brand-subtitle">Ocean Professional</span>
          </div>
        </div>
        <div className="op-header-actions">
          <button
            className="op-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="op-main">
        <AppRouter />
      </main>

      <NavBar />

      {/* Portals for modals and overlays */}
      <div id="modal-root" />
      <div id="toast-root" />
    </div>
  );
}

export default App;
