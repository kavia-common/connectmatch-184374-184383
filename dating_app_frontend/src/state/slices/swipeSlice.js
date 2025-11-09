//
// Swipe slice: recommendation queue, current index, like/pass tracking
//

export const initialSwipeState = {
  queue: [],        // array of profile cards
  index: 0,         // pointer to current profile
  loading: false,
  error: null,
  lastAction: null, // { action: 'like'|'pass', targetId }
};

const types = {
  SET_QUEUE: 'swipe/setQueue',
  APPEND_QUEUE: 'swipe/appendQueue',
  NEXT: 'swipe/next',
  LIKE: 'swipe/like',
  PASS: 'swipe/pass',
  RESET: 'swipe/reset',
  SET_LOADING: 'swipe/setLoading',
  SET_ERROR: 'swipe/setError',
};

export function swipeReducer(state = initialSwipeState, action) {
  switch (action.type) {
    case types.SET_QUEUE:
      return { ...state, queue: Array.isArray(action.payload) ? action.payload : [], index: 0, loading: false, error: null };
    case types.APPEND_QUEUE:
      return { ...state, queue: [...state.queue, ...(Array.isArray(action.payload) ? action.payload : [])] };
    case types.NEXT: {
      const nextIndex = Math.min(state.index + 1, Math.max(state.queue.length - 1, 0));
      return { ...state, index: nextIndex };
    }
    case types.LIKE:
      return { ...state, lastAction: { action: 'like', targetId: action.payload } };
    case types.PASS:
      return { ...state, lastAction: { action: 'pass', targetId: action.payload } };
    case types.RESET:
      return { ...initialSwipeState };
    case types.SET_LOADING:
      return { ...state, loading: Boolean(action.payload) };
    case types.SET_ERROR:
      return { ...state, error: action.payload ?? 'Unknown error', loading: false };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function swipeActions(dispatch) {
  /**
   * Returns swipe-related actions bound to dispatch.
   */
  return {
    setQueue(items) {
      dispatch({ type: types.SET_QUEUE, payload: items });
    },
    appendQueue(items) {
      dispatch({ type: types.APPEND_QUEUE, payload: items });
    },
    next() {
      dispatch({ type: types.NEXT });
    },
    like(targetId) {
      dispatch({ type: types.LIKE, payload: targetId });
      dispatch({ type: types.NEXT });
    },
    pass(targetId) {
      dispatch({ type: types.PASS, payload: targetId });
      dispatch({ type: types.NEXT });
    },
    reset() {
      dispatch({ type: types.RESET });
    },
    setLoading(isLoading) {
      dispatch({ type: types.SET_LOADING, payload: isLoading });
    },
    setError(err) {
      dispatch({ type: types.SET_ERROR, payload: err });
    },
  };
}
