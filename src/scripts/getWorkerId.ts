import { Store } from 'webext-redux';
import { getReactProps, ReactPropsCopyText } from '../utils/getReactProps';
import { mturkUpdate } from '../store/mturk/actions';

const store = new Store();

store.ready().then(async () => {
  const props: ReactPropsCopyText = await getReactProps('CopyText');
  store.dispatch(mturkUpdate({ key: 'workerId', value: props.textToCopy }));
});
