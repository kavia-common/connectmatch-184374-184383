import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * NavBar - Main app navigation with four tabs.
 * Highlights active route and becomes a bottom bar on small screens.
 */
export default function NavBar() {
  const tabs = [
    { to: '/', label: 'Home', icon: '🏠', end: true },
    { to: '/matches', label: 'Matches', icon: '💞' },
    { to: '/messages', label: 'Messages', icon: '💬' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
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
    </nav>
  );
}
