import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import Theme from '../../components/Theme';

import App from './components/App';

const store = new Store();

store.ready().then(() => {
  ReactDom.render(
    <Provider store={store}>
      <Theme>
        <App />
      </Theme>
    </Provider>,
    document.getElementById('root'),
  );
});
