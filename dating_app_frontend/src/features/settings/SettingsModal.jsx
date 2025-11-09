import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Icon } from '../../components/common';

/**
 * PUBLIC_INTERFACE
 * SettingsModal - App settings dialog with theme toggle and mock notification preferences.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 *
 * Behavior:
 * - Reads current theme from document.documentElement[data-theme]
 * - Toggles light/dark theme and persists to sessionStorage for this session
 * - Provides mock notification toggles (email, push, in-app)
 * - Accessible: focus management via Modal, labeled switches, and ARIA attributes
 */
export default function SettingsModal({ open, onClose }) {
  const [theme, setTheme] = useState('light');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const focusRef = useRef(null);

  // Initialize theme from DOM attribute
  useEffect(() => {
    if (!open) return;
    const curr = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(curr);
  }, [open]);

  function applyTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    try {
      sessionStorage.setItem('theme', next);
    } catch (_e) {}
  }

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
  }

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="secondary" onClick={onClose}>Close</Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      initialFocusRef={focusRef}
      size="md"
      footer={footer}
      describedBy="settings-desc"
    >
      <p id="settings-desc" style={{ marginTop: 0, color: 'var(--op-text-muted)' }}>
        Customize your appearance and notifications.
      </p>

      <section className="stg-section" aria-labelledby="stg-appearance">
        <h3 id="stg-appearance" className="stg-subtitle">Appearance</h3>
        <div className="stg-row">
          <div className="stg-row-main">
            <div className="stg-row-title">Theme</div>
            <div className="stg-row-desc">Switch between light and dark modes.</div>
          </div>
          <div className="stg-row-action">
            <Button ref={focusRef} variant="secondary" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <><Icon name="moon" /> Dark</> : <><Icon name="sun" /> Light</>}
            </Button>
          </div>
        </div>
      </section>

      <section className="stg-section" aria-labelledby="stg-notify">
        <h3 id="stg-notify" className="stg-subtitle">Notifications</h3>
        <div className="stg-row">
          <div className="stg-row-main">
            <div className="stg-row-title">Email</div>
            <div className="stg-row-desc">Receive updates and match summaries by email.</div>
          </div>
          <div className="stg-row-action">
            <label className="stg-switch">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                aria-label="Email notifications"
              />
              <span className="stg-slider" aria-hidden="true"></span>
            </label>
          </div>
        </div>
        <div className="stg-row">
          <div className="stg-row-main">
            <div className="stg-row-title">Push</div>
            <div className="stg-row-desc">Get push notifications for new messages.</div>
          </div>
          <div className="stg-row-action">
            <label className="stg-switch">
              <input
                type="checkbox"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
                aria-label="Push notifications"
              />
              <span className="stg-slider" aria-hidden="true"></span>
            </label>
          </div>
        </div>
        <div className="stg-row">
          <div className="stg-row-main">
            <div className="stg-row-title">In-app</div>
            <div className="stg-row-desc">Show in-app alerts and badges.</div>
          </div>
          <div className="stg-row-action">
            <label className="stg-switch">
              <input
                type="checkbox"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
                aria-label="In-app notifications"
              />
              <span className="stg-slider" aria-hidden="true"></span>
            </label>
          </div>
        </div>
      </section>

      <style>{`
        .stg-section { margin-bottom: 16px; }
        .stg-subtitle { margin: 0 0 8px; font-size: 16px; color: var(--op-text); }
        .stg-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid var(--op-border);
        }
        .stg-row:first-of-type { border-top: none; }
        .stg-row-title { font-weight: 700; color: var(--op-text); }
        .stg-row-desc { color: var(--op-text-muted); font-size: 13px; }
        .stg-row-action { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }

        /* Switch component */
        .stg-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 26px;
        }
        .stg-switch input {
          opacity: 0; width: 0; height: 0; position: absolute;
        }
        .stg-slider {
          position: absolute; cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background: var(--op-border);
          transition: .2s;
          border-radius: 9999px;
          border: 1px solid var(--op-border);
        }
        .stg-slider::before {
          position: absolute; content: "";
          height: 20px; width: 20px;
          left: 3px; top: 50%; transform: translateY(-50%);
          background: var(--op-surface);
          transition: .2s;
          border-radius: 9999px;
          box-shadow: var(--op-shadow);
        }
        .stg-switch input:checked + .stg-slider {
          background: rgba(37,99,235,0.3);
          border-color: rgba(37,99,235,0.5);
        }
        .stg-switch input:checked + .stg-slider::before {
          transform: translate(18px, -50%);
          background: var(--op-primary);
        }
        .stg-switch input:focus-visible + .stg-slider {
          box-shadow: 0 0 0 3px rgba(37,99,235,0.35);
        }
      `}</style>
    </Modal>
  );
}
