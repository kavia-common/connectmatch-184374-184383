//
// Environment utility for React app
// Provides safe accessors for REACT_APP_* variables, feature flags parsing,
// environment metadata, and sensible fallbacks without hardcoding URLs.
//

/**
 * INTERNAL: Parse a comma/space-separated list into a Set of lowercased tokens.
 */
function parseListToSet(val) {
  if (!val || typeof val !== 'string') return new Set();
  return new Set(
    val
      .split(/[, ]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.toLowerCase())
  );
}

/**
 * INTERNAL: Resolve base API URL from precedence of vars.
 * Order: REACT_APP_API_BASE -> REACT_APP_BACKEND_URL -> window.location.origin (fallback)
 */
function resolveApiBase() {
  const fromApiBase = process.env.REACT_APP_API_BASE?.trim();
  const fromBackend = process.env.REACT_APP_BACKEND_URL?.trim();

  const chosen = fromApiBase || fromBackend;
  if (chosen) {
    return stripTrailingSlash(chosen);
  }
  // Safe default: current origin to avoid hardcoding URLs
  if (typeof window !== 'undefined' && window.location?.origin) {
    return stripTrailingSlash(window.location.origin);
  }
  return ''; // empty for SSR/test environments
}

/**
 * INTERNAL: Resolve WS base URL with protocol-aware fallback.
 * Uses REACT_APP_WS_URL or derives from window.location.
 */
function resolveWsBase() {
  const explicit = process.env.REACT_APP_WS_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  if (typeof window !== 'undefined' && window.location) {
    const isHttps = window.location.protocol === 'https:';
    const proto = isHttps ? 'wss' : 'ws';
    return `${proto}://${window.location.host}`;
  }
  return ''; // test/SSR fallback
}

/**
 * INTERNAL: Strip trailing slash to ensure consistent URL joining
 */
function stripTrailingSlash(url) {
  if (!url) return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * INTERNAL: Join base URL and path safely with a single slash.
 */
function joinUrl(base, path) {
  if (!base) return path || '';
  const b = stripTrailingSlash(base);
  if (!path) return b;
  return path.startsWith('/') ? `${b}${path}` : `${b}/${path}`;
}

// PUBLIC_INTERFACE
export function getEnv() {
  /**
   * Returns normalized environment configuration for the frontend.
   * Includes URLs, environment toggles, feature flags, and defaults.
   */
  const apiBase = resolveApiBase();
  const wsBase = resolveWsBase();

  const nodeEnv = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development';
  const isDev = nodeEnv === 'development';
  const isProd = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const featuresRaw = process.env.REACT_APP_FEATURE_FLAGS || '';
  const experimentsEnabled = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

  // Feature flags: comma or space separated values e.g. "realtime, new-cards"
  const featureFlagsSet = parseListToSet(featuresRaw);

  // Additional optional controls
  const telemetryDisabled = String(process.env.REACT_APP_NEXT_TELEMETRY_DISABLED || '').toLowerCase() === 'true';
  const enableSourceMaps = String(process.env.REACT_APP_ENABLE_SOURCE_MAPS || '').toLowerCase() !== 'false'; // default true
  const port = process.env.REACT_APP_PORT ? Number(process.env.REACT_APP_PORT) : undefined;
  const trustProxy = String(process.env.REACT_APP_TRUST_PROXY || '').toLowerCase() === 'true';
  const logLevel = process.env.REACT_APP_LOG_LEVEL || (isProd ? 'warn' : 'debug');
  const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/healthz';

  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  return {
    nodeEnv,
    isDev,
    isProd,
    isTest,

    // URLs
    apiBase, // normalized (no trailing slash)
    wsBase,  // normalized (no trailing slash)
    frontendUrl,

    // Flags
    telemetryDisabled,
    enableSourceMaps,
    trustProxy,
    experimentsEnabled,
    featureFlagsSet, // Set<string> of lowercased flags
    featureFlags: Array.from(featureFlagsSet),

    // Misc
    logLevel,
    port,
    healthPath,

    // Helpers
    joinUrl,
  };
}

// PUBLIC_INTERFACE
export function isFeatureEnabled(flagName) {
  /**
   * Checks if a feature flag is enabled (case-insensitive).
   */
  if (!flagName) return false;
  const { featureFlagsSet } = getEnv();
  return featureFlagsSet.has(String(flagName).toLowerCase());
}
