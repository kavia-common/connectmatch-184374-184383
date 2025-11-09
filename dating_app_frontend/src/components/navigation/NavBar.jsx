import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import SettingsModal from '../../features/settings/SettingsModal';

/**
 * PUBLIC_INTERFACE
 * NavBar - Main app navigation with four tabs.
 * Highlights active route and becomes a bottom bar on small screens.
 * Also provides quick access to Settings via a floating action.
 */
export default function NavBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { to: '/', label: 'Home', icon: '🏠', end: true },
    { to: '/matches', label: 'Matches', icon: '💞' },
    { to: '/messages', label: 'Messages', icon: '💬' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      <nav className="op-navbar" role="navigation" aria-label="Primary">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              'op-nav-item' + (isActive ? ' op-nav-item-active' : '')
            }
          >
            <span className="op-nav-icon" aria-hidden="true">{t.icon}</span>
            <span className="op-nav-label">{t.label}</span>
          </NavLink>
        ))}
        {/* Quick Settings button at end for accessibility */}
        <button
          type="button"
          className="op-nav-item"
          aria-label="Open settings"
          onClick={() => setSettingsOpen(true)}
          style={{ justifySelf: 'end', display: 'none' }}
        >
          <span className="op-nav-icon" aria-hidden="true">⚙️</span>
          <span className="op-nav-label">Settings</span>
        </button>
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
