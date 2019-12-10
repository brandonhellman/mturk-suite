import { applyMiddleware, createStore, combineReducers, Middleware } from 'redux';
import { createLogger } from 'redux-logger';
import { wrapStore } from 'webext-redux';

import { blocksReducer } from './blocks/reducers';
import { mturkReducer } from './mturk/reducers';
import { optionsReducer } from './options/reducers';

const logger = createLogger();

const rootReducer = combineReducers({
  blocks: blocksReducer,
  mturk: mturkReducer,
  options: optionsReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export function configureStore(...middlewares: Middleware[]) {
  const store = createStore(rootReducer, applyMiddleware(...middlewares, logger));
  wrapStore(store);
  return store;
}

export type AppStore = ReturnType<typeof configureStore>;
