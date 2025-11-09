import React, { useEffect, useMemo, useState } from 'react';
import SwipeCard from './SwipeCard';
import { Card, Button, Modal, Icon } from '../../components/common';
import { useSwipe, useUser } from '../../state/store';
import { recommendationsApi, interactionsApi } from '../../api/endpoints';

/**
 * PUBLIC_INTERFACE
 * SwipeDeck - Manages the swipe queue, loads recommendations, and handles interactions.
 *
 * - Fetches recommendations from GET /profiles/recommendations (mapped to /api/recommendations fallback)
 * - On like: POST /interactions/like (fallback to POST /api/interactions {action:'like'})
 * - On pass: POST /interactions/pass (fallback to POST /api/interactions {action:'pass'})
 * - Shows a mini "It's a Match" modal when mutual=true returned from like API.
 * - Gracefully falls back with local mock data if API is unavailable.
 */
export default function SwipeDeck() {
  const [swipeState, swipeActions] = useSwipe();
  const [userState] = useUser();
  const [loading, setLoading] = useState(false);
  const [matchModal, setMatchModal] = useState({ open: false, profile: null });

  // Helper: transform backend profile to our card format
  function normalizeProfile(p, i) {
    if (!p || typeof p !== 'object') return null;
    return {
      id: p.id ?? p.userId ?? `rec-${i}`,
      name: p.name || 'Unknown',
      age: p.age || p.meta?.age || null,
      bio: p.bio || p.about || '',
      interests: Array.isArray(p.interests) ? p.interests : Array.isArray(p.tags) ? p.tags : [],
      photos: Array.isArray(p.photos) && p.photos.length ? p.photos : (p.photo ? [p.photo] : []),
    };
  }

  async function loadRecommendations() {
    setLoading(true);
    swipeActions.setLoading(true);
    try {
      // Primary path as per request: GET /profiles/recommendations
      let list;
      try {
        const res = await recommendationsApi.list
          ? await recommendationsApi.list()
          : await fetch('/profiles/recommendations', { headers: { Accept: 'application/json' } }).then(r => r.json());
        list = res?.data || res || [];
      } catch (_e) {
        // Fallback to alternate path /profiles/recommendations (absolute) if first failed
        try {
          const res2 = await fetch('/profiles/recommendations', { headers: { Accept: 'application/json' } });
          list = await res2.json();
        } catch (_e2) {
          list = [];
        }
      }

      let normalized = Array.isArray(list) ? list.map(normalizeProfile).filter(Boolean) : [];
      if (normalized.length === 0) {
        // Graceful fallback mock data
        normalized = [
          {
            id: 'm-1',
            name: 'Jordan',
            age: 28,
            bio: 'Product designer. Coffee enthusiast and weekend hiker.',
            interests: ['Design', 'Hiking', 'Coffee', 'Art'],
            photos: [],
          },
          {
            id: 'm-2',
            name: 'Taylor',
            age: 31,
            bio: 'Engineer who loves jazz and cooking.',
            interests: ['Jazz', 'Cooking', 'Tech'],
            photos: [],
          },
          {
            id: 'm-3',
            name: 'Riley',
            age: 26,
            bio: 'Avid reader and traveler.',
            interests: ['Books', 'Travel', 'Photography'],
            photos: [],
          },
        ];
      }
      swipeActions.setQueue(normalized);
    } catch (e) {
      swipeActions.setError('Failed to load recommendations.');
    } finally {
      setLoading(false);
      swipeActions.setLoading(false);
    }
  }

  useEffect(() => {
    if (!Array.isArray(swipeState.queue) || swipeState.queue.length === 0) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = useMemo(() => {
    if (!Array.isArray(swipeState.queue) || swipeState.queue.length === 0) return null;
    return swipeState.queue[swipeState.index] || null;
  }, [swipeState.queue, swipeState.index]);

  async function sendInteraction(targetId, action) {
    // Prefer explicit endpoints: POST /interactions/like or /interactions/pass
    try {
      const url = action === 'like' ? '/interactions/like' : '/interactions/pass';
      const body = { targetUserId: targetId };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      let payload = null;
      try {
        payload = await res.json();
      } catch (_e) {}
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return payload;
    } catch (_e) {
      // Fallback to generic API wrapper if custom paths are not available
      try {
        const { data } = await interactionsApi.create({ targetUserId: targetId, action });
        return data;
      } catch (_e2) {
        return null;
      }
    }
  }

  async function handleLike(profile) {
    swipeActions.like(profile?.id);
    const result = await sendInteraction(profile?.id, 'like');
    if (result?.mutual === true || result?.match === true) {
      setMatchModal({ open: true, profile });
    }
  }

  async function handlePass(profile) {
    swipeActions.pass(profile?.id);
    await sendInteraction(profile?.id, 'pass');
  }

  function resetDeck() {
    swipeActions.setQueue([]);
    swipeActions.reset();
    loadRecommendations();
  }

  return (
    <section className="swd-wrap">
      <header className="swd-header">
        <h2 className="swd-title">Discover</h2>
        <div className="swd-sub">Swipe through profiles tailored to you.</div>
        <div className="swd-actions">
          <Button variant="secondary" size="sm" onClick={resetDeck}>Refresh</Button>
        </div>
      </header>

      <div className="swd-stage" aria-live="polite" aria-busy={loading}>
        <div className="swd-stack">
          {Array.isArray(swipeState.queue) && swipeState.queue.length > 0 ? (
            swipeState.queue.slice(swipeState.index, swipeState.index + 3).map((p, i) => (
              <SwipeCard
                key={p.id}
                profile={p}
                index={i}
                onLike={handleLike}
                onPass={handlePass}
              />
            ))
          ) : (
            <Card padding="lg">
              <p className="op-desc" style={{ margin: 0 }}>
                {loading ? 'Loading recommendations…' : 'No more recommendations right now. Try refreshing.'}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <Button variant="secondary" onClick={resetDeck}>Reload</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <footer className="swd-footer" aria-hidden={false}>
        <div className="swd-footer-inner">
          <Button
            variant="secondary"
            ariaLabel="Pass"
            iconLeft="close"
            onClick={() => current && handlePass(current)}
            disabled={!current}
          >
            Pass
          </Button>
          <Button
            ariaLabel="Like"
            iconLeft="heart"
            onClick={() => current && handleLike(current)}
            disabled={!current}
          >
            Like
          </Button>
        </div>
      </footer>

      <Modal
        open={matchModal.open}
        onClose={() => setMatchModal({ open: false, profile: null })}
        title="It’s a Match!"
        size="sm"
        footer={
          <Button onClick={() => setMatchModal({ open: false, profile: null })}>
            Start Chat
          </Button>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'rgba(37,99,235,0.08)',
            display: 'grid', placeItems: 'center'
          }}>
            <Icon name="heart" size={24} color="var(--op-secondary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--op-text)' }}>
              You and {matchModal.profile?.name || 'someone'} like each other.
            </div>
            <div style={{ color: 'var(--op-text-muted)', fontSize: 14 }}>
              Send a message to break the ice!
            </div>
          </div>
        </div>
      </Modal>

      <style>{`
        .swd-wrap { position: relative; }
        .swd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .swd-title { margin: 0; font-size: 22px; color: var(--op-text); }
        .swd-sub { color: var(--op-text-muted); font-size: 14px; }
        .swd-actions { display: flex; gap: 8px; }

        .swd-stage {
          position: relative;
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          aspect-ratio: 3 / 4;
        }
        .swd-stack {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .swd-footer {
          margin-top: 14px;
        }
        .swd-footer-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .swd-title { font-size: 24px; }
          .swd-stage { max-width: 640px; }
        }
        @media (max-width: 480px) {
          .swd-stage { aspect-ratio: 4 / 5; }
        }
      `}</style>
    </section>
  );
}
