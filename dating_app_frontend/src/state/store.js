import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { initialUserState, userReducer, userActions } from './slices/userSlice';
import { initialSwipeState, swipeReducer, swipeActions } from './slices/swipeSlice';
import { initialChatState, chatReducer, chatActions } from './slices/chatSlice';

/**
 * Root reducer that delegates to each slice reducer.
 * Each slice reducer receives only its sub-state and returns an updated copy.
 */
function rootReducer(state, action) {
  return {
    user: userReducer(state.user, action),
    swipe: swipeReducer(state.swipe, action),
    chat: chatReducer(state.chat, action),
  };
}

/**
 * Build the initial global state from slice initial states.
 */
const initialState = {
  user: initialUserState,
  swipe: initialSwipeState,
  chat: initialChatState,
};

// Contexts for state and dispatch to avoid needless re-renders
const StateContext = createContext(undefined);
const DispatchContext = createContext(undefined);

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  /**
   * AppProvider composes Context + useReducer for global app state.
   * Exposes state and a typed actions object to children.
   */
  const [state, dispatch] = useReducer(rootReducer, initialState);

  // Create a stable actions API that dispatches typed actions
  const actions = useMemo(() => {
    return {
      user: userActions(dispatch),
      swipe: swipeActions(dispatch),
      chat: chatActions(dispatch),
    };
  }, [dispatch]);

  const stateValue = useMemo(() => state, [state]);

  return (
    <StateContext.Provider value={stateValue}>
      <DispatchContext.Provider value={actions}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAppState() {
  /**
   * Access the entire app state tree.
   */
  const ctx = useContext(StateContext);
  if (ctx === undefined) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function useAppActions() {
  /**
   * Access all namespaced actions: { user, swipe, chat }.
   */
  const ctx = useContext(DispatchContext);
  if (ctx === undefined) {
    throw new Error('useAppActions must be used within AppProvider');
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function useUser() {
  /**
   * Convenience hook to access user slice state and actions.
   */
  const { user } = useAppState();
  const { user: actions } = useAppActions();
  return [user, actions];
}

// PUBLIC_INTERFACE
export function useSwipe() {
  /**
   * Convenience hook to access swipe slice state and actions.
   */
  const { swipe } = useAppState();
  const { swipe: actions } = useAppActions();
  return [swipe, actions];
}

// PUBLIC_INTERFACE
export function useChat() {
  /**
   * Convenience hook to access chat slice state and actions.
   */
  const { chat } = useAppState();
  const { chat: actions } = useAppActions();
  return [chat, actions];
}
