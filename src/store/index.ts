import { applyMiddleware, createStore, combineReducers, Middleware } from 'redux';
import { createLogger } from 'redux-logger';
import { wrapStore } from 'webext-redux';

import { mturkReducer } from './mturk/reducers';
import { optionsReducer } from './options/reducers';

const logger = createLogger();

const rootReducer = combineReducers({
  mturk: mturkReducer,
  options: optionsReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export function configureStore(...middlewares: Middleware[]) {
  const store = createStore(rootReducer, applyMiddleware(...middlewares, logger));
  wrapStore(store);
  return store;
}
