import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon } from '../../components/common';
import { matchesApi, conversationsApi } from '../../api/endpoints';

/**
 * PUBLIC_INTERFACE
 * MatchesList - Displays a grid of matched profiles. Each item links to its conversation.
 *
 * Behavior:
 * - Loads matches via matchesApi.list() (GET /api/matches)
 * - Fallbacks:
 *    - If API fails or returns empty, tries GET /matches (non-/api) as a secondary attempt
 *    - If still empty, shows graceful empty state with guidance
 * - Normalizes payload fields to render avatar, name, and a link to /messages/:conversationId
 * - Provides a refresh button and handles loading/error states
 */
export default function MatchesList() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function normalizeItem(item, idx) {
    // Accept different backend shapes and normalize
    // Expected possibilities:
    // - { id, conversationId, user: { id, name, avatar } }
    // - { id, conversationId, peer: { id, name, avatarUrl } }
    // - { matchId, convoId, name, avatar }
    if (!item || typeof item !== 'object') return null;

    const user =
      item.user ||
      item.peer ||
      item.matchedUser ||
      item.partner ||
      {};

    const name =
      item.name ||
      user.name ||
      user.displayName ||
      'Unknown';

    const avatar =
      item.avatar ||
      user.avatar ||
      user.avatarUrl ||
      (Array.isArray(user.photos) && user.photos.length ? user.photos[0] : null) ||
      null;

    const conversationId =
      item.conversationId ||
      item.convoId ||
      item.threadId ||
      item.chatId ||
      null;

    const id = item.id || item.matchId || user.id || `match-${idx}`;

    return {
      id,
      name,
      avatar,
      conversationId,
      raw: item,
    };
  }

  async function loadMatches() {
    setLoading(true);
    setError(null);
    try {
      // Primary path: matchesApi.list -> GET /api/matches
      let listData = [];
      try {
        const res = await matchesApi.list ? await matchesApi.list() : null;
        const raw = res?.data ?? res ?? [];
        listData = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
      } catch (_e) {
        // Secondary direct fetch if wrapper fails
        try {
          const r2 = await fetch('/api/matches', { headers: { Accept: 'application/json' } });
          const j2 = await r2.json().catch(() => []);
          listData = Array.isArray(j2) ? j2 : (Array.isArray(j2?.items) ? j2.items : []);
        } catch (_e2) {
          // Tertiary attempt: a non-/api route if backend served it differently
          try {
            const r3 = await fetch('/matches', { headers: { Accept: 'application/json' } });
            const j3 = await r3.json().catch(() => []);
            listData = Array.isArray(j3) ? j3 : (Array.isArray(j3?.items) ? j3.items : []);
          } catch (_e3) {
            listData = [];
          }
        }
      }

      const normalized = (listData || []).map(normalizeItem).filter(Boolean);

      // Optional: If there are matches without conversationId, try to find or create one
      // For now, we just display without link if conversationId is missing.
      setMatches(normalized);
    } catch (e) {
      setError('Failed to load matches.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMatches = useMemo(() => Array.isArray(matches) && matches.length > 0, [matches]);

  return (
    <section className="ml-wrap">
      <header className="ml-header">
        <h2 className="ml-title">Matches</h2>
        <div className="ml-sub">See who you’ve matched with and start a conversation.</div>
        <div className="ml-actions">
          <Button variant="secondary" size="sm" onClick={loadMatches} ariaLabel="Refresh matches">
            Refresh
          </Button>
        </div>
      </header>

      <Card padding="md" className="ml-card">
        {loading && (
          <div className="ml-state">
            <Icon name="spinner" spin label="Loading" />
            <span>Loading matches…</span>
          </div>
        )}

        {!loading && error && (
          <div className="ml-state">
            <Icon name="warning" />
            <span>{error}</span>
            <div className="ml-state-actions">
              <Button variant="secondary" onClick={loadMatches}>Try Again</Button>
            </div>
          </div>
        )}

        {!loading && !error && hasMatches && (
          <ul className="ml-grid" role="list">
            {matches.map((m) => {
              const content = (
                <div className="ml-item" aria-label={m.name}>
                  <div className="ml-avatar" aria-hidden="true">
                    {m.avatar ? (
                      <img src={m.avatar} alt="" />
                    ) : (
                      <div className="ml-avatar-fallback">👤</div>
                    )}
                  </div>
                  <div className="ml-name">{m.name}</div>
                </div>
              );
              // Link only if conversationId available
              return (
                <li key={m.id} className="ml-cell">
                  {m.conversationId ? (
                    <Link to={`/messages/${encodeURIComponent(m.conversationId)}`} className="ml-link">
                      {content}
                    </Link>
                  ) : (
                    <div className="ml-link ml-link-disabled" title="Conversation not available yet">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && !hasMatches && (
          <div className="ml-state">
            <span>It looks a bit quiet here.</span>
            <span className="ml-state-sub">Start swiping to build your matches!</span>
            <div className="ml-state-actions">
              <Button variant="primary" as="a" href="/">Discover</Button>
            </div>
          </div>
        )}
      </Card>

      <style>{`
        .ml-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .ml-title { margin: 0; font-size: 22px; color: var(--op-text); }
        .ml-sub { color: var(--op-text-muted); font-size: 14px; }
        .ml-actions { display: flex; gap: 8px; margin-left: auto; }

        .ml-card { overflow: visible; }

        .ml-state {
          display: grid;
          place-items: center;
          gap: 10px;
          color: var(--op-text-muted);
          min-height: 120px;
          text-align: center;
        }
        .ml-state-sub {
          font-size: 14px;
        }
        .ml-state-actions {
          margin-top: 8px;
          display: flex;
          gap: 8px;
        }

        .ml-grid {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (min-width: 640px) {
          .ml-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (min-width: 900px) {
          .ml-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        .ml-cell {}
        .ml-link {
          display: block;
          border: 1px solid var(--op-border);
          background: var(--op-surface);
          border-radius: 14px;
          padding: 12px;
          transition: transform .15s ease, border-color .2s ease, box-shadow .2s ease;
          box-shadow: var(--op-shadow);
          color: var(--op-text);
        }
        .ml-link:hover {
          transform: translateY(-2px);
          border-color: rgba(37,99,235,0.25);
          box-shadow: 0 12px 20px -5px rgba(0,0,0,.1), 0 6px 8px -6px rgba(0,0,0,.08);
        }
        .ml-link-disabled {
          opacity: .7;
          cursor: not-allowed;
          box-shadow: none;
        }

        .ml-item {
          display: grid;
          grid-template-rows: auto auto;
          gap: 8px;
          align-items: center;
          justify-items: center;
          text-align: center;
        }
        .ml-avatar {
          width: 88px;
          height: 88px;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(37,99,235,0.12), rgba(255,255,255,0.02));
          border: 1px solid var(--op-border);
          display: grid;
          place-items: center;
        }
        .ml-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ml-avatar-fallback {
          font-size: 36px;
          color: var(--op-text-muted);
        }
        .ml-name {
          font-weight: 700;
          color: var(--op-text);
        }
      `}</style>
    </section>
  );
}
