import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button, Icon } from '../../components/common';

/**
 * PUBLIC_INTERFACE
 * SwipeCard - Interactive profile card with drag gestures and accessible Like/Pass buttons.
 *
 * Props:
 * - profile: object { id, name, age, bio, photos: [url], interests: [] }
 * - onLike: (profile) => void
 * - onPass: (profile) => void
 * - onDragStart?: () => void
 * - onDragEnd?: () => void
 * - index?: number - stack index for z-order and scale
 *
 * Behavior:
 * - Drag horizontally to like (right) or pass (left) with thresholds
 * - Keyboard accessible via buttons; buttons have aria-labels
 * - Animations on swipe out; smooth transitions
 * - Responsive layout with Ocean Professional styling
 */
export default function SwipeCard({
  profile,
  onLike,
  onPass,
  onDragStart,
  onDragEnd,
  index = 0,
}) {
  const cardRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const [drag, setDrag] = useState({ dx: 0, dy: 0, dragging: false });
  const [exiting, setExiting] = useState(null); // 'left' | 'right' | null

  const threshold = 120; // px to trigger like/pass
  const rot = useMemo(() => Math.max(-15, Math.min(15, drag.dx / 10)), [drag.dx]);
  const opacityLike = useMemo(() => Math.min(1, Math.max(0, drag.dx / threshold)), [drag.dx]);
  const opacityPass = useMemo(() => Math.min(1, Math.max(0, -drag.dx / threshold)), [drag.dx]);

  useEffect(() => {
    // Prevent image dragging default
    const node = cardRef.current;
    if (!node) return;
    const imgs = node.querySelectorAll('img');
    imgs.forEach((img) => {
      img.setAttribute('draggable', 'false');
    });
  }, []);

  function handlePointerDown(e) {
    const point = 'touches' in e ? e.touches[0] : e;
    startRef.current = { x: point.clientX, y: point.clientY };
    setDrag((d) => ({ ...d, dragging: true }));
    if (onDragStart) onDragStart();
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  }

  function handlePointerMove(e) {
    const point = 'touches' in e ? e.touches[0] : e;
    if ('touches' in e) {
      // prevent scrolling while dragging
      e.preventDefault();
    }
    const dx = point.clientX - startRef.current.x;
    const dy = point.clientY - startRef.current.y;
    setDrag({ dx, dy, dragging: true });
  }

  function cleanupListeners() {
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);
  }

  function handlePointerUp() {
    cleanupListeners();
    const abs = Math.abs(drag.dx);
    if (abs > threshold) {
      const direction = drag.dx > 0 ? 'right' : 'left';
      setExiting(direction);
      // animate out, then call like/pass
      const offX = direction === 'right' ? window.innerWidth : -window.innerWidth;
      if (cardRef.current) {
        const node = cardRef.current;
        node.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        node.style.transform = `translate(${offX}px, ${drag.dy}px) rotate(${rot}deg)`;
        node.style.opacity = '0';
      }
      setTimeout(() => {
        if (direction === 'right') {
          onLike?.(profile);
        } else {
          onPass?.(profile);
        }
        setDrag({ dx: 0, dy: 0, dragging: false });
        setExiting(null);
        if (onDragEnd) onDragEnd();
      }, 280);
      return;
    }
    // reset position
    setDrag({ dx: 0, dy: 0, dragging: false });
    if (onDragEnd) onDragEnd();
  }

  function triggerLike() {
    if (exiting) return;
    setExiting('right');
    if (cardRef.current) {
      const node = cardRef.current;
      node.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      node.style.transform = `translate(${window.innerWidth}px, 0) rotate(10deg)`;
      node.style.opacity = '0';
    }
    setTimeout(() => {
      onLike?.(profile);
      setExiting(null);
    }, 260);
  }

  function triggerPass() {
    if (exiting) return;
    setExiting('left');
    if (cardRef.current) {
      const node = cardRef.current;
      node.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      node.style.transform = `translate(${-window.innerWidth}px, 0) rotate(-10deg)`;
      node.style.opacity = '0';
    }
    setTimeout(() => {
      onPass?.(profile);
      setExiting(null);
    }, 260);
  }

  const transform = `translate(${drag.dx}px, ${drag.dy}px) rotate(${rot}deg)`;
  const zIndex = 10 - index;
  const scale = index === 0 ? 1 : Math.max(0.9, 1 - index * 0.03);
  const topCardStyles = index === 0 ? {
    cursor: drag.dragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  } : {};

  const photo = Array.isArray(profile?.photos) && profile.photos.length > 0 ? profile.photos[0] : null;

  return (
    <article
      ref={cardRef}
      className="swc-card"
      style={{
        zIndex,
        transform: index === 0 ? transform : `scale(${scale}) translateY(${index * 8}px)`,
        opacity: 1,
        ...topCardStyles,
      }}
      onMouseDown={index === 0 ? handlePointerDown : undefined}
      onTouchStart={index === 0 ? handlePointerDown : undefined}
      role="group"
      aria-roledescription="Swipeable profile card"
      aria-label={`${profile?.name || 'Unknown'}, ${profile?.age || 'N/A'}`}
    >
      <div className="swc-media">
        {photo ? (
          <img src={photo} alt={`${profile?.name || 'Profile'} photo`} />
        ) : (
          <div className="swc-photo-fallback" aria-hidden>
            <span>👤</span>
          </div>
        )}
        {/* Overlays for Like/Pass indicators */}
        <div className="swc-badge swc-like" style={{ opacity: opacityLike }}>
          <Icon name="check" /> Like
        </div>
        <div className="swc-badge swc-pass" style={{ opacity: opacityPass }}>
          <Icon name="close" /> Pass
        </div>
      </div>

      <div className="swc-info">
        <h3 className="swc-title">
          {profile?.name || 'Unknown'}{profile?.age ? <span className="swc-age"> {profile.age}</span> : null}
        </h3>
        {profile?.bio ? <p className="swc-bio">{profile.bio}</p> : null}
        {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
          <div className="swc-tags" aria-label="Interests">
            {profile.interests.slice(0, 6).map((tag, i) => (
              <span className="swc-tag" key={`${tag}-${i}`}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Accessible controls */}
      {index === 0 && (
        <div className="swc-actions" role="group" aria-label="Swipe actions">
          <Button
            variant="secondary"
            ariaLabel="Pass"
            iconLeft="close"
            onClick={triggerPass}
          >
            Pass
          </Button>
          <Button
            ariaLabel="Like"
            iconLeft="heart"
            onClick={triggerLike}
          >
            Like
          </Button>
        </div>
      )}

      <style>{`
        .swc-card {
          position: absolute;
          inset: 0;
          background: var(--op-surface);
          border: 1px solid var(--op-border);
          border-radius: 18px;
          box-shadow: var(--op-shadow);
          overflow: hidden;
          transition: transform .2s ease;
          will-change: transform, opacity;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }
        .swc-media {
          position: relative;
          height: 58%;
          background: linear-gradient(180deg, rgba(37,99,235,0.12), rgba(255,255,255,0.02));
        }
        .swc-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .swc-photo-fallback {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-size: 48px;
          color: var(--op-text-muted);
          background: linear-gradient(180deg, rgba(15,23,42,0.1), rgba(255,255,255,0.04));
        }
        .swc-badge {
          position: absolute;
          top: 12px;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 2px solid currentColor;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(6px);
          transition: opacity .15s ease;
          pointer-events: none;
        }
        .swc-like {
          left: 12px;
          color: var(--op-success);
        }
        .swc-pass {
          right: 12px;
          color: var(--op-error);
        }

        .swc-info {
          padding: 14px 16px 0;
        }
        .swc-title {
          margin: 0 0 6px;
          font-size: 20px;
          color: var(--op-text);
        }
        .swc-age { color: var(--op-text-muted); font-weight: 600; }
        .swc-bio {
          margin: 0;
          color: var(--op-text-muted);
          font-size: 14px;
        }
        .swc-tags {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .swc-tag {
          padding: 6px 10px;
          font-size: 12px;
          color: var(--op-text);
          border: 1px solid var(--op-border);
          border-radius: 9999px;
          background: rgba(37,99,235,0.06);
        }

        .swc-actions {
          padding: 12px 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        @media (min-width: 768px) {
          .swc-media { height: 62%; }
          .swc-title { font-size: 22px; }
        }
      `}</style>
    </article>
  );
}
