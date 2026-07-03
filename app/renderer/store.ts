/**
 * Redux Store Configuration
 * Simple mock store for development
 */

import { createStore } from 'redux';

// Simple root reducer
function rootReducer(state = {}, action: any) {
  switch (action.type) {
    default:
      return state;
  }
}

// Create and export store
export const store = createStore(rootReducer);
