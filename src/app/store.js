// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import usersReducer from '../features/users/usersSlice';

import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';

// Combine all your reducers here
const rootReducer = combineReducers({
  users: usersReducer,
  // add more reducers here 
});

// Redux Persist configuration
const persistConfig = {
  key: 'users', 
  storage,
  whitelist: ['users'], 
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist needs this turned off
    }),
});

// Create a persistor
export const persistor = persistStore(store);
