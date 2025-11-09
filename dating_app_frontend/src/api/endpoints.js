//
// Minimal API endpoint helpers on top of client.request
// No hardcoded base URLs; only relative paths and REACT_APP_* for base resolution.
//

import { request } from './client';

// PUBLIC_INTERFACE
export const recommendationsApi = {
  /** Get recommended profiles for the current user. */
  list(params) {
    return request('/api/recommendations', { method: 'GET', params });
  },
};

// PUBLIC_INTERFACE
export const interactionsApi = {
  /** Send a like or pass interaction. body: { targetUserId, action: 'like'|'pass' } */
  create(body) {
    return request('/api/interactions', { method: 'POST', body });
  },
};

// PUBLIC_INTERFACE
export const matchesApi = {
  /** Get current user's matches */
  list(params) {
    return request('/api/matches', { method: 'GET', params });
  },
};

// PUBLIC_INTERFACE
export const conversationsApi = {
  /** List conversations */
  list(params) {
    return request('/api/conversations', { method: 'GET', params });
  },
  /** Get single conversation by id */
  get(conversationId) {
    return request(`/api/conversations/${encodeURIComponent(conversationId)}`, { method: 'GET' });
  },
  /** Create conversation (optionally) body: { participantId } */
  create(body) {
    return request('/api/conversations', { method: 'POST', body });
  },
};

// PUBLIC_INTERFACE
export const messagesApi = {
  /** List messages for a conversation */
  list(conversationId, params) {
    return request(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, { method: 'GET', params });
  },
  /** Send a new message to a conversation */
  send(conversationId, body) {
    return request(`/api/conversations/${encodeURIComponent(conversationId)}/messages`, { method: 'POST', body });
  },
};

// PUBLIC_INTERFACE
export const usersApi = {
  /** Get current user profile */
  me() {
    return request('/api/users/me', { method: 'GET' });
  },
  /** Update current user profile */
  update(body) {
    return request('/api/users/me', { method: 'PUT', body });
  },
  /** Get a user by id */
  get(userId) {
    return request(`/api/users/${encodeURIComponent(userId)}`, { method: 'GET' });
  },
};
