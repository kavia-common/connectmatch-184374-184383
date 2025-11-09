import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';
import Icon from './Icon';

/**
 * PUBLIC_INTERFACE
 * Modal - Accessible dialog with focus trap and ARIA attributes.
 *
 * Props:
 * - open: boolean - controls visibility
 * - onClose: function - called when the modal requests to close (ESC, backdrop click, close button)
 * - title: string - accessible title
 * - children: modal content
 * - initialFocusRef: optional ref to focus when opened
 * - closeOnBackdrop: boolean (default true)
 * - size: 'sm' | 'md' | 'lg' (default 'md')
 * - footer: optional React node for actions; if omitted, close button is shown
 * - hideCloseButton: boolean (default false)
 * - labelledBy: optional id to use as aria-labelledby; otherwise auto generated
 * - describedBy: optional id to use as aria-describedby
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  initialFocusRef,
  closeOnBackdrop = true,
  size = 'md',
  footer,
  hideCloseButton = false,
  labelledBy,
  describedBy,
  className = '',
}) {
  const modalRoot = document.getElementById('modal-root') || document.body;
  const dialogRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const titleId = useRef(`op-modal-title-${Math.random().toString(36).slice(2)}`);

  // Save and restore last focused element
  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement;
    } else if (!open && lastFocusedRef.current) {
      try { lastFocusedRef.current.focus(); } catch (_e) {}
    }
  }, [open]);

  // Trap focus inside the dialog
  const trapFocus = useCallback((e) => {
    if (!open || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll(
      'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]'
    );
    const focusableEls = Array.from(focusable);
    if (focusableEls.length === 0) return;

    if (e.key === 'Tab') {
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }, [open]);

  // Handle Escape to close
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (onClose) onClose();
    } else {
      trapFocus(e);
    }
  }, [onClose, trapFocus]);

  // Focus initial element when opened
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const target = initialFocusRef?.current || dialogRef.current?.querySelector('[data-autofocus]') || dialogRef.current;
      try { target?.focus(); } catch (_e) {}
    }, 0);
    return () => clearTimeout(t);
  }, [open, initialFocusRef]);

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  const dialog = (
    <div className={`opm-overlay`} role="presentation" onMouseDown={(e) => {
      // backdrop click (exclude clicks that started inside content)
      if (!closeOnBackdrop) return;
      if (e.target === e.currentTarget && onClose) onClose();
    }}>
      <div
        className={['opm-dialog', `opm-${size}`, className].join(' ').trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || titleId.current}
        aria-describedby={describedBy}
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="opm-header">
          <h2 id={labelledBy || titleId.current} className="opm-title">{title}</h2>
          {!hideCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close dialog"
              onClick={onClose}
              className="opm-close"
            >
              <Icon name="close" />
            </Button>
          )}
        </header>
        <div className="opm-body">{children}</div>
        <footer className="opm-footer">
          {footer ?? (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </footer>
      </div>
      <style>{`
        .opm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: grid;
          place-items: center;
          padding: 16px;
          z-index: 50;
        }
        .opm-dialog {
          background: var(--op-surface);
          border: 1px solid var(--op-border);
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04);
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          outline: none;
          color: var(--op-text);
        }
        .opm-sm { max-width: 420px; }
        .opm-md { max-width: 640px; }
        .opm-lg { max-width: 880px; }

        .opm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid var(--op-border);
          position: sticky;
          top: 0;
          background: var(--op-surface);
          z-index: 1;
        }
        .opm-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--op-text);
        }
        .opm-body {
          padding: 18px;
        }
        .opm-footer {
          padding: 16px 18px 18px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          border-top: 1px solid var(--op-border);
        }
        .opm-close {
          border-radius: 10px;
        }

        @media (max-width: 480px) {
          .opm-dialog { border-radius: 14px; }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(dialog, modalRoot);
}
