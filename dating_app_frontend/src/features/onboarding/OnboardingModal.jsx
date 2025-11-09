import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Button } from '../../components/common';
import { useUser } from '../../state/store';
import { usersApi } from '../../api/endpoints';

/**
 * PUBLIC_INTERFACE
 * OnboardingModal - Collects basic user info (name, age, interests) with validation.
 *
 * Props:
 * - open: boolean - controls visibility
 * - onClose: () => void - invoked when dismissed or after successful submit
 *
 * Behavior:
 * - Traps focus via Modal
 * - Validates presence of name, age (>=18), and interests list (comma-separated, max 10)
 * - Persists to user slice (me + onboardingDone=true)
 * - Optionally persists to backend via POST or PUT /api/users/me depending on backend availability
 */
export default function OnboardingModal({ open, onClose }) {
  const [userState, userActions] = useUser();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const nameRef = useRef(null);
  const formId = 'onboarding-form';

  // Pre-fill if existing user data exists
  useEffect(() => {
    const me = userState.me || {};
    if (open) {
      setName(me.name || '');
      setAge(me.age != null ? String(me.age) : '');
      if (Array.isArray(me.interests)) {
        setInterests(me.interests.join(', '));
      } else {
        setInterests('');
      }
      setErrors({});
    }
  }, [open, userState.me]);

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
      e.age = 'You must be at least 18 years old.';
    } else if (ageNum > 120) {
      e.age = 'Please enter a realistic age.';
    }
    if (interestsArray.length === 0) {
      e.interests = 'Add at least one interest (comma-separated).';
    } else if (interestsArray.length > 10) {
      e.interests = 'Please limit to 10 interests.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // Update local state first
      const updated = {
        ...(userState.me || {}),
        name: name.trim(),
        age: Number(age),
        interests: interestsArray,
        onboarded: true,
      };
      userActions.setUser(updated);
      userActions.setOnboardingDone(true);

      // Optional API persistence: try POST first; fallback to PUT if 405/404, or try PUT directly
      try {
        // Not all backends implement POST /users/me; try PUT if POST fails accordingly
        await usersApi.create
          ? usersApi.create(updated)
          : usersApi.update(updated);
      } catch (apiErr) {
        // Attempt PUT if POST not available
        if (usersApi.update) {
          await usersApi.update(updated);
        }
      }

      if (typeof onClose === 'function') onClose();
    } catch (_err) {
      userActions.setError('Failed to save onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="secondary" onClick={onClose} disabled={saving}>
        Cancel
      </Button>
      <Button form={formId} type="submit" onClick={handleSave} loading={saving}>
        Save & Continue
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Welcome! Let’s get you set up"
      initialFocusRef={nameRef}
      size="md"
      footer={footer}
      describedBy="onboarding-desc"
    >
      <p id="onboarding-desc" style={{ marginTop: 0, color: 'var(--op-text-muted)' }}>
        Tell us a bit about you to personalize your experience.
      </p>
      <form id={formId} onSubmit={handleSave} noValidate>
        <div className="op-form-field">
          <label htmlFor="ob-name" className="op-label">Name</label>
          <input
            id="ob-name"
            name="name"
            ref={nameRef}
            type="text"
            className={`op-input ${errors.name ? 'op-input-error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Alex"
            data-autofocus
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'ob-name-err' : undefined}
            required
          />
          {errors.name ? <div id="ob-name-err" className="op-error">{errors.name}</div> : null}
        </div>

        <div className="op-form-field">
          <label htmlFor="ob-age" className="op-label">Age</label>
          <input
            id="ob-age"
            name="age"
            type="number"
            min="18"
            max="120"
            className={`op-input ${errors.age ? 'op-input-error' : ''}`}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="18+"
            aria-invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? 'ob-age-err' : undefined}
            required
          />
          {errors.age ? <div id="ob-age-err" className="op-error">{errors.age}</div> : null}
        </div>

        <div className="op-form-field">
          <label htmlFor="ob-interests" className="op-label">Interests</label>
          <input
            id="ob-interests"
            name="interests"
            type="text"
            className={`op-input ${errors.interests ? 'op-input-error' : ''}`}
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., hiking, jazz, cooking"
            aria-invalid={Boolean(errors.interests)}
            aria-describedby={errors.interests ? 'ob-interests-err' : 'ob-interests-help'}
            required
          />
          {errors.interests ? (
            <div id="ob-interests-err" className="op-error">{errors.interests}</div>
          ) : (
            <div id="ob-interests-help" className="op-help">Comma-separated list, up to 10.</div>
          )}
        </div>
      </form>

      <style>{`
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
        .op-error { color: var(--op-error); font-size: 13px; margin-top: 6px; }
        .op-help { color: var(--op-text-muted); font-size: 12px; margin-top: 6px; }
      `}</style>
    </Modal>
  );
}
