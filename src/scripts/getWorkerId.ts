import { Store } from 'webext-redux';

import { mturkUpdate } from '../store/mturk/actions';
import { selectMturk } from '../store/mturk/selectors';
import { getReactProps, ReactPropsCopyText } from '../utils/getReactProps';

const store = new Store();

store.ready().then(async () => {
  const mturk = selectMturk(store.getState());
  const props: ReactPropsCopyText = await getReactProps('CopyText');

  if (mturk.workerId !== props.textToCopy) {
    store.dispatch(mturkUpdate({ key: 'workerId', value: props.textToCopy }));
  }
});
