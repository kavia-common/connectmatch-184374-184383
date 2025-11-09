import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Button, Icon, Modal } from '../../components/common';
import { usersApi } from '../../api/endpoints';
import { useUser } from '../../state/store';
import SettingsModal from '../settings/SettingsModal';

/**
 * PUBLIC_INTERFACE
 * ProfileView - View and edit current user's profile. Supports fetching via GET /api/users/me
 * and updating via PUT /api/users/me. Includes form validation, accessible controls, and
 * Ocean Professional styling.
 *
 * Behavior:
 * - On mount, attempts to load current user; if state already has me, prefill form.
 * - Editable fields: name (min 2), age (18-120), bio (max 300), interests (comma-separated max 10),
 *   photo URL (first photo).
 * - Provides Save and Reset buttons with loading/disabled states.
 * - Integrates Settings modal entry point with theme toggle and notification toggles.
 */
export default function ProfileView() {
  const [userState, userActions] = useUser();

  // Local form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [photo, setPhoto] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const nameRef = useRef(null);
  const formId = 'profile-edit-form';

  const me = userState.me || null;

  // Hydrate form from state user
  useEffect(() => {
    if (me) {
      setName(me.name || '');
      setAge(me.age != null ? String(me.age) : '');
      setBio(me.bio || me.about || '');
      setInterests(Array.isArray(me.interests) ? me.interests.join(', ') : '');
      const p = Array.isArray(me.photos) && me.photos.length ? me.photos[0] : (me.photo || '');
      setPhoto(p || '');
      setErrors({});
    }
  }, [me]);

  async function loadMe() {
    setLoading(true);
    userActions.setLoading(true);
    try {
      const res = await usersApi.me();
      const data = res?.data ?? res ?? null;
      if (data) {
        userActions.setUser(data);
      }
    } catch (_e) {
      // soft fail: keep local state
      userActions.setError('Failed to load profile.');
    } finally {
      setLoading(false);
      userActions.setLoading(false);
    }
  }

  useEffect(() => {
    // Load if we don't have user data yet
    if (!me) {
      loadMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const interestsArray = useMemo(() => {
    return interests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
  }, [interests]);

  function validate() {
    const e = {};
    if (!name || name.trim().length < 2) {
      e.name = 'Please enter your name (min 2 characters).';
    }
    const ageNum = Number(age);
    if (!age || Number.isNaN(ageNum)) {
      e.age = 'Please enter your age.';
    } else if (ageNum < 18) {
      e.age = 'You must be at least 18.';
    } else if (ageNum > 120) {
      e.age = 'Please enter a realistic age.';
    }
    if (bio && bio.length > 300) {
      e.bio = 'Bio should be at most 300 characters.';
    }
    if (interestsArray.length === 0) {
      e.interests = 'Add at least one interest.';
    } else if (interestsArray.length > 10) {
      e.interests = 'Please limit to 10 interests.';
    }
    if (photo && !/^https?:\/\//i.test(photo)) {
      e.photo = 'Please enter a valid http(s) URL.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!validate()) {
      try { nameRef.current?.focus(); } catch (_e2) {}
      return;
    }
    setSaving(true);
    try {
      const photos = photo ? [photo] : (Array.isArray(me?.photos) ? me.photos : []);
      const updated = {
        ...(me || {}),
        name: name.trim(),
        age: Number(age),
        bio: bio.trim(),
        interests: interestsArray,
        photos,
        onboarded: me?.onboarded ?? true,
      };
      // Optimistically update local state
      userActions.setUser(updated);
      // Persist to backend
      await usersApi.update(updated);
    } catch (_e) {
      userActions.setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (me) {
      setName(me.name || '');
      setAge(me.age != null ? String(me.age) : '');
      setBio(me.bio || me.about || '');
      setInterests(Array.isArray(me.interests) ? me.interests.join(', ') : '');
      const p = Array.isArray(me.photos) && me.photos.length ? me.photos[0] : (me.photo || '');
      setPhoto(p || '');
      setErrors({});
    } else {
      setName('');
      setAge('');
      setBio('');
      setInterests('');
      setPhoto('');
      setErrors({});
    }
    try { nameRef.current?.focus(); } catch (_e) {}
  }

  return (
    <section className="pv-wrap">
      <header className="pv-header">
        <div className="pv-titlegroup">
          <h2 className="pv-title">Your Profile</h2>
          <div className="pv-sub">Manage your details and preferences.</div>
        </div>
        <div className="pv-actions">
          <Button variant="secondary" size="sm" onClick={loadMe} ariaLabel="Refresh profile" disabled={loading}>
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} ariaLabel="Open settings">
            <Icon name="settings" /> Settings
          </Button>
        </div>
      </header>

      <Card padding="lg" className="pv-card" title="Profile details" subtitle="Keep your info up to date.">
        <form id={formId} onSubmit={handleSave} noValidate>
          <div className="op-form-field">
            <label htmlFor="pv-name" className="op-label">Name</label>
            <input
              id="pv-name"
              name="name"
              ref={nameRef}
              type="text"
              className={`op-input ${errors.name ? 'op-input-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alex"
              data-autofocus
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'pv-name-err' : undefined}
              required
            />
            {errors.name ? <div id="pv-name-err" className="op-error">{errors.name}</div> : null}
          </div>

          <div className="pv-grid">
            <div className="op-form-field">
              <label htmlFor="pv-age" className="op-label">Age</label>
              <input
                id="pv-age"
                name="age"
                type="number"
                min="18"
                max="120"
                className={`op-input ${errors.age ? 'op-input-error' : ''}`}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="18+"
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? 'pv-age-err' : undefined}
                required
              />
              {errors.age ? <div id="pv-age-err" className="op-error">{errors.age}</div> : null}
            </div>

            <div className="op-form-field">
              <label htmlFor="pv-photo" className="op-label">Photo URL</label>
              <input
                id="pv-photo"
                name="photo"
                type="url"
                className={`op-input ${errors.photo ? 'op-input-error' : ''}`}
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                aria-invalid={Boolean(errors.photo)}
                aria-describedby={errors.photo ? 'pv-photo-err' : 'pv-photo-help'}
              />
              {errors.photo ? (
                <div id="pv-photo-err" className="op-error">{errors.photo}</div>
              ) : (
                <div id="pv-photo-help" className="op-help">We use the first photo in your list.</div>
              )}
            </div>
          </div>

          <div className="op-form-field">
            <label htmlFor="pv-bio" className="op-label">Bio</label>
            <textarea
              id="pv-bio"
              name="bio"
              rows={4}
              className={`op-input op-input-textarea ${errors.bio ? 'op-input-error' : ''}`}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about you…"
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={errors.bio ? 'pv-bio-err' : 'pv-bio-help'}
            />
            {errors.bio ? (
              <div id="pv-bio-err" className="op-error">{errors.bio}</div>
            ) : (
              <div id="pv-bio-help" className="op-help">{bio.length}/300 characters</div>
            )}
          </div>

          <div className="op-form-field">
            <label htmlFor="pv-interests" className="op-label">Interests</label>
            <input
              id="pv-interests"
              name="interests"
              type="text"
              className={`op-input ${errors.interests ? 'op-input-error' : ''}`}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., hiking, jazz, cooking"
              aria-invalid={Boolean(errors.interests)}
              aria-describedby={errors.interests ? 'pv-interests-err' : 'pv-interests-help'}
              required
            />
            {errors.interests ? (
              <div id="pv-interests-err" className="op-error">{errors.interests}</div>
            ) : (
              <div id="pv-interests-help" className="op-help">Comma-separated list, up to 10.</div>
            )}
          </div>

          <div className="pv-preview">
            <div className="pv-avatar" aria-hidden="true">
              {photo ? <img src={photo} alt="" /> : <div className="pv-avatar-fallback">👤</div>}
            </div>
            <div className="pv-overview">
              <div className="pv-name">{name || 'Your name'}{age ? <span className="pv-age"> {age}</span> : null}</div>
              <div className="pv-bio-prev">{bio || 'Your bio preview'}</div>
              {interestsArray.length > 0 ? (
                <div className="pv-tags" aria-label="Interests preview">
                  {interestsArray.slice(0, 6).map((tag, i) => (
                    <span className="pv-tag" key={`${tag}-${i}`}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="pv-form-actions">
            <Button variant="secondary" onClick={handleReset} disabled={saving}>Reset</Button>
            <Button type="submit" onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <style>{`
        .pv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .pv-title { margin: 0; font-size: 22px; color: var(--op-text); }
        .pv-sub { color: var(--op-text-muted); font-size: 14px; }
        .pv-actions { display: flex; gap: 8px; margin-left: auto; }

        .op-form-field { margin-bottom: 14px; }
        .op-label { display: block; font-weight: 600; margin-bottom: 6px; color: var(--op-text); }
        .op-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--op-border);
          background: var(--op-surface);
          color: var(--op-text);
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .op-input:focus { border-color: rgba(37,99,235,.5); box-shadow: 0 0 0 3px rgba(37,99,235,.2); }
        .op-input-error { border-color: var(--op-error); }
        .op-input-textarea { resize: vertical; }
        .op-error { color: var(--op-error); font-size: 13px; margin-top: 6px; }
        .op-help { color: var(--op-text-muted); font-size: 12px; margin-top: 6px; }

        .pv-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 640px) {
          .pv-grid { grid-template-columns: 1fr 1fr; }
        }

        .pv-preview {
          margin-top: 18px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--op-border);
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(37,99,235,0.06), rgba(255,255,255,0.02));
        }
        .pv-avatar {
          width: 56px; height: 56px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--op-border);
          background: rgba(37,99,235,0.08);
          display: grid; place-items: center;
        }
        .pv-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pv-avatar-fallback { font-size: 22px; color: var(--op-text-muted); }

        .pv-overview { min-width: 0; }
        .pv-name { font-weight: 700; color: var(--op-text); }
        .pv-age { color: var(--op-text-muted); font-weight: 600; }
        .pv-bio-prev { margin-top: 2px; color: var(--op-text-muted); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pv-tags { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
        .pv-tag {
          padding: 6px 10px; font-size: 12px; color: var(--op-text);
          border: 1px solid var(--op-border); border-radius: 9999px;
          background: rgba(37,99,235,0.06);
        }

        .pv-form-actions { margin-top: 14px; display: flex; gap: 8px; justify-content: flex-end; }
      `}</style>
    </section>
  );
}
