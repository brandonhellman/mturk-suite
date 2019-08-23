import { configureStore } from '../../store';
import { initContextMenus } from './initContextMenus';

const store = configureStore();
initContextMenus(store);
