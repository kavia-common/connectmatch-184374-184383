//
// User slice: handles auth-ish user profile and loading/error states
//

export const initialUserState = {
  me: null,          // current user object
  loading: false,    // loading status for profile fetch/update
  error: null,       // string or object with error details
  onboardingDone: false, // deprecated UI flag (kept for compatibility); prefer me.onboarded
};

// Action type constants
const types = {
  SET_USER: 'user/setUser',
  CLEAR_USER: 'user/clearUser',
  SET_LOADING: 'user/setLoading',
  SET_ERROR: 'user/setError',
  SET_ONBOARDING_DONE: 'user/setOnboardingDone',
};

// Reducer
export function userReducer(state = initialUserState, action) {
  switch (action.type) {
    case types.SET_USER:
      return { ...state, me: action.payload, loading: false, error: null };
    case types.CLEAR_USER:
      return { ...state, me: null };
    case types.SET_LOADING:
      return { ...state, loading: Boolean(action.payload) };
    case types.SET_ERROR:
      return { ...state, error: action.payload ?? 'Unknown error', loading: false };
    case types.SET_ONBOARDING_DONE:
      return { ...state, onboardingDone: Boolean(action.payload) };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function userActions(dispatch) {
  /**
   * Returns namespaced user actions bound to dispatch.
   */
  return {
    setUser(user) {
      dispatch({ type: types.SET_USER, payload: user });
    },
    clearUser() {
      dispatch({ type: types.CLEAR_USER });
    },
    setLoading(isLoading) {
      dispatch({ type: types.SET_LOADING, payload: isLoading });
    },
    setError(err) {
      dispatch({ type: types.SET_ERROR, payload: err });
    },
    setOnboardingDone(done) {
      dispatch({ type: types.SET_ONBOARDING_DONE, payload: done });
    },
  };
}
