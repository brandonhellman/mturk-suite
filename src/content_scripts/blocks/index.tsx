import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'webext-redux';

import { AppState } from '../../store';
import { selectOptions } from '../../store/options/selectors';
import { getReactEl } from '../../utils/getReactEl';
import { getReactProps, ReactPropsHitSetTable } from '../../utils/getReactProps';

import { BlocksContextProvider } from './BlocksContext';
import BlocksHidden from './BlocksHidden';
import BlocksModal from './BlocksModal';
import BlocksModalButton from './BlocksModalButton';
import BlocksQuickAddButtons from './BlocksQuickAddButtons';

const store = new Store<AppState>();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.blocks) {
    return;
  }

  const el = await getReactEl('HitSetTable');
  const props: ReactPropsHitSetTable = await getReactProps('HitSetTable');

  const react = document.createElement('div');
  document.body.append(react);

  ReactDom.render(
    <Provider store={store}>
      <BlocksContextProvider>
        <BlocksHidden el={el} props={props} />
        <BlocksModal />
        <BlocksModalButton />
        <BlocksQuickAddButtons el={el} props={props} />
      </BlocksContextProvider>
    </Provider>,
    react,
  );
});
