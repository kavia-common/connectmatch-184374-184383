import React, { useState, useEffect } from 'react';
import './App.css';
import AppRouter from './routes/AppRouter';
import NavBar from './components/navigation/NavBar';
import OnboardingModal from './features/onboarding/OnboardingModal';
import { useUser } from './state/store';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return sessionStorage.getItem('theme') || 'light';
    } catch (_e) {
      return 'light';
    }
  });
  const [userState, userActions] = useUser();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Apply theme to document element so CSS variables can react
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Show onboarding when app loads if not yet completed.
  useEffect(() => {
    // Determine onboarding flag from either user.me.onboarded or slice flag
    const isDone = Boolean(userState?.onboardingDone) || Boolean(userState?.me?.onboarded);
    setOnboardingOpen(!isDone);
  }, [userState?.onboardingDone, userState?.me?.onboarded]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleOnboardingClose = () => {
    // If user still not onboarded, allow closing but keep the flag; next load will prompt again.
    setOnboardingOpen(false);
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

      <OnboardingModal open={onboardingOpen} onClose={handleOnboardingClose} />

      {/* Portals for modals and overlays */}
      <div id="modal-root" />
      <div id="toast-root" />
    </div>
  );
}

export default App;
