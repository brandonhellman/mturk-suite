import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { selectOptions } from '../store/options/selectors';
import { getReactEl } from '../utils/getReactEl';
import { getReactProps, ReactPropsHitSetTable } from '../utils/getReactProps';

import { BlockListButton } from './components/BlockListButton';
import { BlockListModal } from './containers/BlockListModal';

const store = new Store();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.blockList) {
    return;
  }

  const el = await getReactEl('HitSetTable');
  const props: ReactPropsHitSetTable = await getReactProps('HitSetTable');

  const react = document.createElement('span');
  document.querySelector('[data-target="#filter"]').insertAdjacentElement('beforebegin', react);

  ReactDom.render(
    // @ts-ignore
    <Provider store={store}>
      <BlockListButton />
      <BlockListModal />
    </Provider>,
    react,
  );
});
