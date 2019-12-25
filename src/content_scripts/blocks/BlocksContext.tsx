import React, { useContext, useReducer } from 'react';

import { Block } from '../../store/blocks/types';

interface BlocksContextState {
  view: 'default' | 'add' | 'edit';
  block: Block;
}

const blocksContextInitialState: BlocksContextState = {
  view: 'default',
  block: {
    name: '',
    match: '',
    strict: true,
  },
};

function blocksContextReducer(state: BlocksContextState, value: Partial<BlocksContextState>) {
  return {
    ...state,
    ...value,
  };
}

const BlocksContext = React.createContext(undefined);

export function BlocksContextProvider({ children }: any) {
  return (
    <BlocksContext.Provider value={useReducer(blocksContextReducer, blocksContextInitialState)}>
      {children}
    </BlocksContext.Provider>
  );
}

export const useBlocksContext = () => useContext(BlocksContext);
