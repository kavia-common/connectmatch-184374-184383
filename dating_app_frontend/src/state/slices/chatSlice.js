//
// Chat slice: conversations, messages map by conversationId, active conversation
//

export const initialChatState = {
  conversations: [],          // list of conversations
  messagesByConvId: {},       // { [conversationId]: Message[] }
  activeConversationId: null, // currently opened conversation
  loading: false,
  error: null,
  unreadByConvId: {},         // { [conversationId]: number }
};

const types = {
  SET_CONVERSATIONS: 'chat/setConversations',
  UPSERT_CONVERSATION: 'chat/upsertConversation',
  SET_ACTIVE_CONVERSATION: 'chat/setActiveConversation',
  SET_MESSAGES: 'chat/setMessages',
  APPEND_MESSAGE: 'chat/appendMessage',
  PREPEND_MESSAGES: 'chat/prependMessages',
  INCREMENT_UNREAD: 'chat/incrementUnread',
  CLEAR_UNREAD: 'chat/clearUnread',
  SET_LOADING: 'chat/setLoading',
  SET_ERROR: 'chat/setError',
  RESET: 'chat/reset',
};

export function chatReducer(state = initialChatState, action) {
  switch (action.type) {
    case types.SET_CONVERSATIONS:
      return { ...state, conversations: Array.isArray(action.payload) ? action.payload : [], loading: false, error: null };
    case types.UPSERT_CONVERSATION: {
      const conv = action.payload;
      const idx = state.conversations.findIndex((c) => c.id === conv.id);
      const nextConvs = [...state.conversations];
      if (idx >= 0) nextConvs[idx] = { ...nextConvs[idx], ...conv };
      else nextConvs.unshift(conv);
      return { ...state, conversations: nextConvs };
    }
    case types.SET_ACTIVE_CONVERSATION:
      return { ...state, activeConversationId: action.payload || null };
    case types.SET_MESSAGES: {
      const { conversationId, messages } = action.payload || {};
      if (!conversationId) return state;
      return {
        ...state,
        messagesByConvId: {
          ...state.messagesByConvId,
          [conversationId]: Array.isArray(messages) ? messages : [],
        },
      };
    }
    case types.PREPEND_MESSAGES: {
      const { conversationId, messages } = action.payload || {};
      if (!conversationId || !Array.isArray(messages)) return state;
      const existing = state.messagesByConvId[conversationId] || [];
      return {
        ...state,
        messagesByConvId: { ...state.messagesByConvId, [conversationId]: [...messages, ...existing] },
      };
    }
    case types.APPEND_MESSAGE: {
      const { conversationId, message } = action.payload || {};
      if (!conversationId || !message) return state;
      const existing = state.messagesByConvId[conversationId] || [];
      return {
        ...state,
        messagesByConvId: { ...state.messagesByConvId, [conversationId]: [...existing, message] },
      };
    }
    case types.INCREMENT_UNREAD: {
      const { conversationId, by = 1 } = action.payload || {};
      if (!conversationId) return state;
      const current = state.unreadByConvId[conversationId] || 0;
      return {
        ...state,
        unreadByConvId: { ...state.unreadByConvId, [conversationId]: current + by },
      };
    }
    case types.CLEAR_UNREAD: {
      const { conversationId } = action.payload || {};
      if (!conversationId) return state;
      const next = { ...state.unreadByConvId };
      next[conversationId] = 0;
      return { ...state, unreadByConvId: next };
    }
    case types.SET_LOADING:
      return { ...state, loading: Boolean(action.payload) };
    case types.SET_ERROR:
      return { ...state, error: action.payload ?? 'Unknown error', loading: false };
    case types.RESET:
      return { ...initialChatState };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function chatActions(dispatch) {
  /**
   * Returns chat-related actions bound to dispatch.
   */
  return {
    setConversations(list) {
      dispatch({ type: types.SET_CONVERSATIONS, payload: list });
    },
    upsertConversation(conv) {
      dispatch({ type: types.UPSERT_CONVERSATION, payload: conv });
    },
    setActiveConversation(conversationId) {
      dispatch({ type: types.SET_ACTIVE_CONVERSATION, payload: conversationId });
      if (conversationId) {
        dispatch({ type: types.CLEAR_UNREAD, payload: { conversationId } });
      }
    },
    setMessages(conversationId, messages) {
      dispatch({ type: types.SET_MESSAGES, payload: { conversationId, messages } });
    },
    prependMessages(conversationId, messages) {
      dispatch({ type: types.PREPEND_MESSAGES, payload: { conversationId, messages } });
    },
    appendMessage(conversationId, message) {
      dispatch({ type: types.APPEND_MESSAGE, payload: { conversationId, message } });
    },
    incrementUnread(conversationId, by = 1) {
      dispatch({ type: types.INCREMENT_UNREAD, payload: { conversationId, by } });
    },
    clearUnread(conversationId) {
      dispatch({ type: types.CLEAR_UNREAD, payload: { conversationId } });
    },
    setLoading(isLoading) {
      dispatch({ type: types.SET_LOADING, payload: isLoading });
    },
    setError(err) {
      dispatch({ type: types.SET_ERROR, payload: err });
    },
    reset() {
      dispatch({ type: types.RESET });
    },
  };
}
