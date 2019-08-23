import { configureStore } from '../../store';
import { contextMenus } from './contextMenus';

const store = configureStore();
contextMenus(store);
