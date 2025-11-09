import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon } from '../../components/common';
import { conversationsApi } from '../../api/endpoints';
import { useChat } from '../../state/store';

/**
 * PUBLIC_INTERFACE
 * ConversationsList - Lists user's conversations with latest message preview.
 *
 * Behavior:
 * - Loads conversations via GET /api/conversations
 * - Shows loading/error/empty states
 * - Displays unread count badge (if available from state)
 * - Refresh button to reload
 * - Accessible and responsive layout
 */
export default function ConversationsList() {
  const [chatState, chatActions] = useChat();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadConversations() {
    setLoading(true);
    setError(null);
    chatActions.setLoading(true);
    try {
      let list = [];
      try {
        const res = await conversationsApi.list();
        const raw = res?.data ?? res ?? [];
        list = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
      } catch (_e) {
        // Fallback direct fetch if wrapper not available
        const r = await fetch('/api/conversations', { headers: { Accept: 'application/json' } });
        const j = await r.json().catch(() => []);
        list = Array.isArray(j) ? j : (Array.isArray(j?.items) ? j.items : []);
      }

      const normalized = (list || []).map((c, idx) => normalizeConversation(c, idx)).filter(Boolean);
      chatActions.setConversations(normalized);
    } catch (_e) {
      setError('Failed to load conversations.');
    } finally {
      setLoading(false);
      chatActions.setLoading(false);
    }
  }

  useEffect(() => {
    // Load on mount if not present
    if (!Array.isArray(chatState.conversations) || chatState.conversations.length === 0) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conversations = useMemo(() => chatState.conversations || [], [chatState.conversations]);
  const hasConversations = conversations.length > 0;

  return (
    <section className="cl-wrap">
      <header className="cl-header">
        <h2 className="cl-title">Messages</h2>
        <div className="cl-sub">Your recent conversations</div>
        <div className="cl-actions">
          <Button variant="secondary" size="sm" onClick={loadConversations} ariaLabel="Refresh conversations">
            Refresh
          </Button>
        </div>
      </header>

      <Card padding="md" className="cl-card">
        {loading && (
          <div className="cl-state" role="status" aria-live="polite">
            <Icon name="spinner" spin label="Loading" />
            <span>Loading conversations…</span>
          </div>
        )}

        {!loading && error && (
          <div className="cl-state" role="alert">
            <Icon name="warning" />
            <span>{error}</span>
            <div className="cl-state-actions">
              <Button variant="secondary" onClick={loadConversations}>Try Again</Button>
            </div>
          </div>
        )}

        {!loading && !error && hasConversations && (
          <ul className="cl-list" role="list">
            {conversations.map((c) => {
              const unread = chatState.unreadByConvId?.[c.id] || c.unreadCount || 0;
              return (
                <li key={c.id} className="cl-item">
                  <Link to={`/messages/${encodeURIComponent(c.id)}`} className="cl-link" aria-label={`Open chat with ${c.title || 'conversation'}`}>
                    <div className="cl-avatar" aria-hidden="true">
                      {c.avatar ? <img src={c.avatar} alt="" /> : <div className="cl-avatar-fallback">💬</div>}
                    </div>
                    <div className="cl-main">
                      <div className="cl-top">
                        <div className="cl-name">{c.title || c.partnerName || 'Conversation'}</div>
                        <div className="cl-meta">{formatTime(c.updatedAt || c.lastMessageAt)}</div>
                      </div>
                      <div className="cl-bottom">
                        <div className="cl-preview">{c.lastMessage?.text || c.preview || 'Start the conversation'}</div>
                        {unread > 0 ? <div className="cl-unread" aria-label={`${unread} unread messages`}>{unread}</div> : null}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && !error && !hasConversations && (
          <div className="cl-state">
            <span>No conversations yet.</span>
            <span className="cl-state-sub">Match with someone and start chatting!</span>
          </div>
        )}
      </Card>

      <style>{`
        .cl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .cl-title { margin: 0; font-size: 22px; color: var(--op-text); }
        .cl-sub { color: var(--op-text-muted); font-size: 14px; }
        .cl-actions { display: flex; gap: 8px; margin-left: auto; }

        .cl-state {
          display: grid;
          place-items: center;
          gap: 10px;
          color: var(--op-text-muted);
          min-height: 120px;
          text-align: center;
        }
        .cl-state-sub { font-size: 14px; }
        .cl-state-actions { margin-top: 8px; display: flex; gap: 8px; }

        .cl-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 8px;
        }
        .cl-item {}
        .cl-link {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: center;
          padding: 10px;
          border: 1px solid var(--op-border);
          border-radius: 12px;
          background: var(--op-surface);
          transition: border-color .2s ease, box-shadow .2s ease, transform .15s ease;
        }
        .cl-link:hover {
          transform: translateY(-1px);
          border-color: rgba(37,99,235,.25);
          box-shadow: 0 12px 20px -5px rgba(0,0,0,.1), 0 6px 8px -6px rgba(0,0,0,.08);
        }

        .cl-avatar {
          width: 44px; height: 44px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--op-border);
          background: linear-gradient(180deg, rgba(37,99,235,0.12), rgba(255,255,255,0.02));
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .cl-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cl-avatar-fallback { font-size: 20px; color: var(--op-text-muted); }

        .cl-main {
          min-width: 0; /* enable ellipsis */
        }
        .cl-top {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .cl-name {
          font-weight: 700; color: var(--op-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .cl-meta {
          color: var(--op-text-muted); font-size: 12px; flex-shrink: 0;
        }
        .cl-bottom {
          margin-top: 2px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .cl-preview {
          color: var(--op-text-muted); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .cl-unread {
          min-width: 22px; height: 22px; padding: 0 6px;
          display: inline-grid; place-items: center;
          border-radius: 9999px;
          background: var(--op-primary); color: #fff;
          font-size: 12px; font-weight: 700;
        }

        @media (min-width: 768px) {
          .cl-title { font-size: 24px; }
        }
      `}</style>
    </section>
  );
}

function normalizeConversation(c, idx) {
  if (!c || typeof c !== 'object') return null;
  const id = c.id || c.conversationId || c.threadId || `conv-${idx}`;
  const partner = c.partner || c.user || c.peer || {};
  const title = c.title || partner.name || c.name || 'Conversation';
  const avatar = c.avatar || partner.avatar || partner.avatarUrl || null;
  const lastMessage = c.lastMessage || c.latestMessage || null;
  const preview = c.preview || lastMessage?.text || '';
  const updatedAt = c.updatedAt || c.lastMessageAt || lastMessage?.createdAt || null;
  const unreadCount = c.unreadCount || 0;
  return { id, title, avatar, lastMessage, preview, updatedAt, unreadCount, raw: c };
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const now = Date.now();
    const diff = Math.max(0, now - d.getTime());
    const oneDay = 24 * 60 * 60 * 1000;
    if (diff < oneDay) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  } catch (_e) {
    return '';
  }
}
