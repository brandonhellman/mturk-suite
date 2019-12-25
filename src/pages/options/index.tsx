import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { AppState } from '../../store';

import App from './components/App';

const store = new Store<AppState>();

store.ready().then(() => {
  ReactDom.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
});
