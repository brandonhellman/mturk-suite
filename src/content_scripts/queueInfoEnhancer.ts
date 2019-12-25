import { Store } from 'webext-redux';

import { AppState } from '../store';
import { selectOptions } from '../store/options/selectors';
import { getReactProps, ReactPropsTaskQueueTable } from '../utils/getReactProps';

const store = new Store<AppState>();

store.ready().then(async () => {
  const options = selectOptions(store.getState());

  if (!options.scripts.queueInfoEnhancer) {
    return;
  }

  const props: ReactPropsTaskQueueTable = await getReactProps('TaskQueueTable');
  const reward = props.bodyData.reduce((acc, task) => acc + task.project.monetary_reward.amount_in_dollars, 0);

  const header = document.querySelector('h1.m-b-0');
  header.textContent = `${header.textContent.trim().slice(0, -1)} - $${reward.toFixed(2)})`;
});
