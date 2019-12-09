import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { App } from './components/App';

const store = new Store();

store.ready().then(() => {
  ReactDom.render(
    // @ts-ignore
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
});
