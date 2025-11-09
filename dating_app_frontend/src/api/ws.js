//
// Lightweight WebSocket client with safe fallbacks.
// - Uses REACT_APP_WS_URL or derives from window.location
// - Provides connect/subscribe/send/close
// - No-WS environments fall back gracefully (no crashes)
//

import { getEnv, isFeatureEnabled } from '../utils/env';

function hasWebSocket() {
  return typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined';
}

/**
 * PUBLIC_INTERFACE
 * createWsClient - returns a small WS client with connect/subscribe/send/close.
 * Options:
 *  - path: string path e.g. '/ws' (joined with wsBase)
 *  - protocols: optional subprotocols
 *  - autoConnect: boolean (default: false)
 *  - onOpen, onMessage, onClose, onError: optional callbacks
 */
export function createWsClient(options = {}) {
  const {
    path = '/ws',
    protocols,
    autoConnect = false,
    onOpen,
    onMessage,
    onClose,
    onError,
  } = options;

  const { wsBase, joinUrl, logLevel } = getEnv();

  let ws = null;
  const subscribers = new Set();

  function logDebug(...args) {
    if (getEnv().logLevel === 'debug') {
      // eslint-disable-next-line no-console
      console.debug('[ws]', ...args);
    }
  }

  function connect() {
    if (!hasWebSocket()) {
      logDebug('WebSocket unavailable in this environment.');
      return false;
    }
    if (!wsBase) {
      logDebug('WS base URL is empty. Skipping connect.');
      return false;
    }
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return true;
    }

    const url = joinUrl(wsBase, path);
    try {
      ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
    } catch (e) {
      if (typeof onError === 'function') onError(e);
      return false;
    }

    ws.onopen = (evt) => {
      logDebug('open', url);
      if (typeof onOpen === 'function') onOpen(evt);
    };

    ws.onmessage = (evt) => {
      let data = evt.data;
      try {
        data = JSON.parse(evt.data);
      } catch (_e) {
        // keep raw if not JSON
      }
      subscribers.forEach((cb) => {
        try {
          cb(data, evt);
        } catch (err) {
          if (logLevel === 'debug') {
            // eslint-disable-next-line no-console
            console.debug('[ws] subscriber error', err);
          }
        }
      });
      if (typeof onMessage === 'function') onMessage(evt);
    };

    ws.onclose = (evt) => {
      logDebug('close', evt.code, evt.reason);
      if (typeof onClose === 'function') onClose(evt);
    };

    ws.onerror = (evt) => {
      if (typeof onError === 'function') onError(evt);
    };

    return true;
  }

  function send(payload) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      if (typeof payload === 'string') {
        ws.send(payload);
      } else {
        ws.send(JSON.stringify(payload));
      }
      return true;
    } catch (_e) {
      return false;
    }
  }

  // PUBLIC_INTERFACE
  function subscribe(handler) {
    /**
     * Subscribe to incoming messages. Returns an unsubscribe function.
     */
    if (typeof handler !== 'function') return () => {};
    subscribers.add(handler);
    return () => {
      subscribers.delete(handler);
    };
  }

  function close(code, reason) {
    if (ws) {
      try {
        ws.close(code, reason);
      } catch (_e) {
        // ignore
      }
    }
  }

  // Optional experiments: allow gating realtime with a flag
  const realtimeEnabled = isFeatureEnabled('realtime');

  if (autoConnect && realtimeEnabled) {
    connect();
  }

  return {
    connect,
    send,
    subscribe,
    close,
    get readyState() {
      return ws ? ws.readyState : WebSocket.CLOSED;
    },
  };
}
