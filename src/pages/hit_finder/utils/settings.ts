import localStorageGetObject from '../../../utils/localStorageGetObject';
import localStorageSetObject from '../../../utils/localStorageSetObject';

export interface Settings {
  delayInMs: string;
  filterSort: 'updated_desc';
  filterPageSize: string;
  filterMasters: boolean;
  filterQualified: boolean;
  filterMinReward: string;
  filterSearchTerm: string;
  newHitSound: 'voice';
  newHitVolume: string;
  favoriteSound: 'voice';
  favoriteVolume: string;
  favoriteRetriggerDelayInMin: string;
  recentHitsTime: boolean;
  recentHitsRequesterColumn: boolean;
  recentHitsTitleColumn: boolean;
  recentHitsAvailableColumn: boolean;
  recentHitsRewardColumn: boolean;
  recentHitsHitCatcherColumn: boolean;
  loggedHitsTime: boolean;
  loggedHitsRequesterColumn: boolean;
  loggedHitsTitleColumn: boolean;
  loggedHitsAvailableColumn: boolean;
  loggedHitsRewardColumn: boolean;
  loggedHitsHitCatcherColumn: boolean;
  favoriteHitsTime: boolean;
  favoriteHitsRequesterColumn: boolean;
  favoriteHitsTitleColumn: boolean;
  favoriteHitsAvailableColumn: boolean;
  favoriteHitsRewardColumn: boolean;
  favoriteHitsHitCatcherColumn: boolean;
}

export function loadSettings() {
  return localStorageGetObject<Settings>('MTSv3_HF_SETTINGS', {
    delayInMs: '5000',
    filterSort: 'updated_desc',
    filterPageSize: '20',
    filterMasters: false,
    filterQualified: false,
    filterMinReward: '0',
    filterSearchTerm: '',
    newHitSound: 'voice',
    newHitVolume: '100',
    favoriteSound: 'voice',
    favoriteVolume: '100',
    favoriteRetriggerDelayInMin: '15',
    recentHitsTime: false,
    recentHitsRequesterColumn: true,
    recentHitsTitleColumn: true,
    recentHitsAvailableColumn: true,
    recentHitsRewardColumn: true,
    recentHitsHitCatcherColumn: true,
    loggedHitsTime: false,
    loggedHitsRequesterColumn: true,
    loggedHitsTitleColumn: true,
    loggedHitsAvailableColumn: true,
    loggedHitsRewardColumn: true,
    loggedHitsHitCatcherColumn: true,
    favoriteHitsTime: false,
    favoriteHitsRequesterColumn: true,
    favoriteHitsTitleColumn: true,
    favoriteHitsAvailableColumn: true,
    favoriteHitsRewardColumn: true,
    favoriteHitsHitCatcherColumn: true,
  });
}

export function saveSettings(object: object) {
  localStorageSetObject('MTSv3_HF_SETTINGS', object);
}
