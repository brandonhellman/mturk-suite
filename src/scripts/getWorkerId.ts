import { Store } from 'webext-redux';

import { mturkUpdate } from '../store/mturk/actions';
import { getReactProps, ReactPropsCopyText } from '../utils/getReactProps';

const store = new Store();

store.ready().then(async () => {
  const props: ReactPropsCopyText = await getReactProps('CopyText');
  store.dispatch(mturkUpdate({ key: 'workerId', value: props.textToCopy }));
});
