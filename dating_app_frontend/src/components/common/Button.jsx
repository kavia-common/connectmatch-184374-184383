import React from 'react';
import Icon from './Icon';

/**
 * PUBLIC_INTERFACE
 * Button - Themed button with variants and loading/disabled support.
 *
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost' (default 'primary')
 * - size: 'sm' | 'md' | 'lg' (default 'md')
 * - loading: boolean - shows spinner and disables interactions
 * - disabled: boolean
 * - iconLeft, iconRight: optional icon names for left/right icons
 * - children: content
 * - type: 'button' | 'submit' | 'reset'
 * - onClick: handler
 * - fullWidth: boolean to stretch
 * - ariaLabel: optional override for accessibility when no text content
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  children,
  type = 'button',
  onClick,
  fullWidth = false,
  className = '',
  ariaLabel,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const classes = [
    'opc-btn',
    `opc-btn-${variant}`,
    `opc-btn-${size}`,
    fullWidth ? 'opc-btn-block' : '',
    isDisabled ? 'opc-btn-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  const contentLabel = typeof children === 'string' ? children : undefined;
  const ariaProps = ariaLabel ? { 'aria-label': ariaLabel } : {};
  const ariaBusy = loading ? { 'aria-busy': true } : {};

  return (
    <button
      type={type}
      className={classes}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      {...ariaProps}
      {...ariaBusy}
      {...rest}
    >
      <span className="opc-btn-inner">
        {loading ? (
          <Icon name="spinner" size={16} className="opc-btn-spinner" spin label={contentLabel ? undefined : 'Loading'} />
        ) : iconLeft ? (
          <Icon name={iconLeft} size={16} className="opc-btn-icon-left" />
        ) : null}
        <span className="opc-btn-label">{children}</span>
        {iconRight ? <Icon name={iconRight} size={16} className="opc-btn-icon-right" /> : null}
      </span>
      <style>{`
        .opc-btn {
          --btn-bg: var(--op-primary);
          --btn-text: #fff;
          --btn-border: transparent;
          --btn-bg-hover: #1d4ed8;
          --btn-shadow: var(--op-shadow);
          appearance: none;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--btn-text);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: var(--btn-shadow);
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, opacity .2s ease, border-color .2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          vertical-align: middle;
          outline: none;
        }
        .opc-btn-sm { padding: 8px 12px; font-size: 12px; }
        .opc-btn-md { padding: 10px 14px; font-size: 14px; }
        .opc-btn-lg { padding: 12px 18px; font-size: 16px; }
        .opc-btn:hover { transform: translateY(-1px); background: var(--btn-bg-hover); }
        .opc-btn:active { transform: translateY(0); }
        .opc-btn:focus-visible { box-shadow: 0 0 0 3px rgba(37,99,235,0.35); }
        .opc-btn-block { width: 100%; }

        .opc-btn-secondary {
          --btn-bg: var(--op-btn-bg-secondary);
          --btn-text: var(--op-btn-text-secondary);
          --btn-border: var(--op-btn-border-secondary);
          --btn-bg-hover: rgba(37,99,235,0.06);
          box-shadow: none;
        }

        .opc-btn-ghost {
          --btn-bg: transparent;
          --btn-text: var(--op-text);
          --btn-border: transparent;
          --btn-bg-hover: rgba(37,99,235,0.06);
          box-shadow: none;
          color: var(--op-text-muted);
        }

        .opc-btn-disabled,
        .opc-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .opc-btn-inner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          line-height: 1;
        }
        .opc-btn-spinner { margin-right: 6px; }
        .opc-btn-icon-left { margin-right: 6px; }
        .opc-btn-icon-right { margin-left: 6px; }
      `}</style>
    </button>
  );
}
