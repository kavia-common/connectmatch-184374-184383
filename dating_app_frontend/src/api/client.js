//
// Minimal HTTP client wrapper using window.fetch
// - Resolves base URL from env
// - Attaches JSON headers
// - Handles JSON request/response bodies
// - Normalizes errors with status and payload
//

import { getEnv } from '../utils/env';

/**
 * INTERNAL: Build a RequestInit with defaults merged.
 */
function buildInit(method = 'GET', body, headers = {}) {
  const init = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined && body !== null) {
    // If content-type is not JSON (overridden), pass raw body
    const ct = (init.headers['Content-Type'] || init.headers['content-type'] || '').toLowerCase();
    init.body = ct.includes('application/json') ? JSON.stringify(body) : body;
  }
  return init;
}

/**
 * INTERNAL: Parse JSON if possible; fallback to text or null
 */
async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (_e) {
      return null;
    }
  }
  try {
    const txt = await res.text();
    return txt || null;
  } catch (_e) {
    return null;
  }
}

/**
 * INTERNAL: Create an AbortController with timeout support.
 */
function createTimeoutSignal(ms) {
  if (!ms || typeof ms !== 'number' || ms <= 0) return undefined;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(new Error('Request timeout')), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

/**
 * PUBLIC_INTERFACE
 * request - perform an HTTP call relative to API base or absolute URLs.
 * - url: string (relative path or absolute URL)
 * - options: { method, params, body, headers, timeout }
 * Returns: { data, status, ok, headers } or throws an Error with { status, data }
 */
export async function request(url, options = {}) {
  /** Minimal fetch wrapper for API calls. */
  const { apiBase, joinUrl, logLevel } = getEnv();

  const {
    method = 'GET',
    params,
    body,
    headers,
    timeout = 15000, // default 15s
    absolute = false, // if true, skip base join and use url as is
  } = options;

  // Construct full URL
  let targetUrl = absolute ? url : joinUrl(apiBase, url);

  // Query params
  if (params && typeof params === 'object') {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((vv) => usp.append(k, String(vv)));
      } else {
        usp.set(k, String(v));
      }
    });
    const q = usp.toString();
    if (q) {
      targetUrl += (targetUrl.includes('?') ? '&' : '?') + q;
    }
  }

  const init = buildInit(method, body, headers);

  // Timeout support
  const t = createTimeoutSignal(timeout);
  if (t?.signal) {
    init.signal = t.signal;
  }

  try {
    const res = await fetch(targetUrl, init);
    if (t?.cancel) t.cancel();

    const payload = await parseResponse(res);

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}: ${res.statusText || 'Request failed'}`);
      err.status = res.status;
      err.data = payload;
      if (logLevel === 'debug') {
        // eslint-disable-next-line no-console
        console.debug('[api] error', { url: targetUrl, status: res.status, payload });
      }
      throw err;
    }

    return {
      data: payload,
      status: res.status,
      ok: true,
      headers: res.headers,
    };
  } catch (e) {
    if (t?.cancel) t.cancel();
    if (e.name === 'AbortError') {
      const err = new Error('Request aborted');
      err.status = 499;
      err.data = null;
      throw err;
    }
    throw e;
  }
}
