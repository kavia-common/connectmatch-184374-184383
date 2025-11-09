import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Card - A surface container with shadow and rounded corners.
 *
 * Props:
 * - title: optional string
 * - subtitle: optional string
 * - actions: optional React node rendered in header area
 * - children: body content
 * - as: element type to render (default 'section')
 * - padding: one of 'none' | 'sm' | 'md' | 'lg' (default 'lg')
 * - interactive: boolean; if true, applies hover lift and cursor
 */
export default function Card({
  title,
  subtitle,
  actions,
  children,
  as: As = 'section',
  padding = 'lg',
  interactive = false,
  className = '',
  ...rest
}) {
  const classes = [
    'opc-card',
    `opc-card-pad-${padding}`,
    interactive ? 'opc-card-interactive' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <As className={classes} {...rest}>
      {(title || actions || subtitle) && (
        <header className="opc-card-header">
          <div className="opc-card-titles">
            {title ? <h2 className="opc-card-title">{title}</h2> : null}
            {subtitle ? <p className="opc-card-subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="opc-card-actions">{actions}</div> : null}
        </header>
      )}
      <div className="opc-card-body">{children}</div>
      <style>{`
        .opc-card {
          background: var(--op-surface);
          border: 1px solid var(--op-border);
          border-radius: var(--op-radius);
          box-shadow: var(--op-shadow);
          color: var(--op-text);
          text-align: left;
          overflow: hidden;
        }
        .opc-card-pad-none { padding: 0; }
        .opc-card-pad-sm { padding: 12px; }
        .opc-card-pad-md { padding: 20px; }
        .opc-card-pad-lg { padding: 28px; }

        .opc-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .opc-card-title {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 700;
          color: var(--op-text);
        }
        .opc-card-subtitle {
          margin: 0;
          font-size: 14px;
          color: var(--op-text-muted);
        }
        .opc-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .opc-card-body {
          font-size: 14px;
          color: var(--op-text);
        }

        .opc-card-interactive {
          transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease;
          cursor: pointer;
        }
        .opc-card-interactive:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -5px rgba(0,0,0,.1), 0 6px 8px -6px rgba(0,0,0,.08);
          border-color: rgba(37,99,235,0.25);
        }

        @media (max-width: 480px) {
          .opc-card-pad-lg { padding: 22px; }
          .opc-card-title { font-size: 18px; }
        }
      `}</style>
    </As>
  );
}
