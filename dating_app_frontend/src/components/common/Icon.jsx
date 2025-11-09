import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Icon - Lightweight inline SVG icon wrapper.
 * - Uses a small built-in set of icons and allows passing custom paths.
 * - Accessible: provides aria-hidden when decorative or aria-label when labeled.
 *
 * Props:
 * - name: one of predefined names ('heart','message','user','home','close','check','warning','settings','moon','sun','arrow-right','spinner')
 * - size: number (px), default 18
 * - color: CSS color string, defaults to currentColor
 * - title: optional string for accessible title/tooltip (uses <title>)
 * - label: accessible label; if provided, icon is announced; otherwise aria-hidden=true
 * - className: extra class names
 * - strokeWidth: default 2
 * - spin: boolean; if true, applies a CSS spin animation for spinner-like icons
 * - path: optional object { d, viewBox } to provide custom SVG path
 */
export default function Icon({
  name,
  size = 18,
  color = 'currentColor',
  title,
  label,
  className = '',
  strokeWidth = 2,
  spin = false,
  path,
  ...rest
}) {
  const icons = {
    heart: {
      d: 'M12 21s-6.716-4.63-9.428-7.34C.86 11.95.5 9.5 2.05 7.95 3.6 6.4 6.05 6.76 7.66 8.37L12 12.7l4.34-4.33c1.61-1.61 4.06-1.97 5.61-.42 1.55 1.55 1.19 4-.28 5.71C18.72 16.37 12 21 12 21z',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      stroke: 'none',
    },
    message: {
      d: 'M21 15a2 2 0 0 1-2 2H8l-4 4V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    user: {
      d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    home: {
      d: 'M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    close: {
      d: 'M18 6L6 18M6 6l12 12',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    check: {
      d: 'M20 6L9 17l-5-5',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    warning: {
      d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    settings: {
      d: 'M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.27 17l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H1a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 4.04 2.27l.06.06c.5.5 1.22.65 1.82.33A1.65 1.65 0 0 0 7.43 1H7.5a2 2 0 1 1 4 0v.09c0 .66.38 1.25.98 1.51.6.32 1.32.17 1.82-.33l.06-.06A2 2 0 1 1 19 4.04l-.06.06c-.5.5-.65 1.22-.33 1.82.26.6.85.98 1.51.98H21a2 2 0 1 1 0 4h-.09c-.66 0-1.25.38-1.51.98z',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    moon: {
      d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      stroke: 'none',
    },
    sun: {
      d: 'M12 4V2m0 20v-2M4 12H2m20 0h-2M5.64 5.64L4.22 4.22M19.78 19.78l-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    'arrow-right': {
      d: 'M5 12h14M13 5l7 7-7 7',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
    spinner: {
      d: 'M12 2a10 10 0 1 0 10 10',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    },
  };

  const icon = path || icons[name] || icons['warning'];
  const ariaProps = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  const titleId = title ? `icon-title-${name}-${Math.random().toString(36).slice(2)}` : undefined;

  const classes = [
    'op-icon',
    spin ? 'op-icon-spin' : '',
    className || '',
  ].join(' ').trim();

  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox || '0 0 24 24'}
      className={classes}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      stroke={icon.stroke || 'currentColor'}
      fill={icon.fill || 'none'}
      strokeWidth={strokeWidth}
      style={{ color }}
      aria-labelledby={titleId}
      {...ariaProps}
      {...rest}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d={icon.d} strokeLinecap="round" strokeLinejoin="round" />
      <style>{`
        .op-icon-spin { animation: op-spin 1s linear infinite; }
        @keyframes op-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </svg>
  );
}
