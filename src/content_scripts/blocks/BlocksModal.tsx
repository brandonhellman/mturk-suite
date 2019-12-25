import React from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';

import { blockCreate, blockUpdate, blockDelete, blocksDeleteAll, blocksImport } from '../../store/blocks/actions';
import { selectBlocks } from '../../store/blocks/selectors';
import { Block, BlocksState } from '../../store/blocks/types';
import { fileDownloaderJson } from '../../utils/fileDownloaderJson';
import { fileReaderJson } from '../../utils/fileReaderJson';

import { useBlocksContext } from './BlocksContext';

function BlocksModal() {
  const dispatch = useDispatch();
  const blocks = useSelector(selectBlocks);
  const [state, reducer] = useBlocksContext();

  function onClickAdd() {
    reducer({ view: 'add' });
  }

  function onClickEdit(block: Block) {
    reducer({ view: 'edit', block: block });
  }

  async function onChangeImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files[0];
    const json = await fileReaderJson<BlocksState>(file);
    dispatch(blocksImport(json));
  }

  function onClickExport() {
    fileDownloaderJson('mts-blocks-export', blocks);
  }

  function onClickDeleteAll() {
    const confirmed = confirm('Are you sure you want to delete all of your blocks?');

    if (confirmed) {
      dispatch(blocksDeleteAll());
    }
  }

  function onClickSave() {
    if (!state.block.name.length || !state.block.match.length) {
      alert(`A name and match are required to ${state.view} a block`);
      return;
    }

    if (state.view === 'add') {
      dispatch(blockCreate(state.block));
    } else if (state.view === 'edit') {
      dispatch(blockUpdate(state.block));
    }

    reducer({ view: 'default', block: { name: '', match: '', strict: false } });
  }

  function onClickBack() {
    reducer({ view: 'default', block: { name: '', match: '', strict: false } });
  }

  function onClickDelete() {
    dispatch(blockDelete(state.block));
    reducer({ view: 'default', block: { name: '', match: '', strict: false } });
  }

  return (
    <div className="modal fade in open" id="blocks-modal" style={{ marginTop: 60 }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Blocks</h2>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              onClick={onClickBack}
              style={{ marginRight: 0 }}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            {state.view === 'default' ? (
              Object.values(blocks).map((block) => (
                <button key={block.match} type="button" className="btn btn-danger" onClick={() => onClickEdit(block)}>
                  {block.name}
                </button>
              ))
            ) : (
              <>
                <div className="input-group m-b-sm">
                  <span className="input-group-addon" id="basic-addon1">
                    Name
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(event) => reducer({ block: { ...state.block, name: event.currentTarget.value } })}
                    placeholder="Nickname for the block"
                    value={state.block.name}
                  />
                </div>
                <div className="input-group m-b-sm">
                  <span className="input-group-addon" id="basic-addon1">
                    Match
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    disabled={state.view === 'edit'}
                    onChange={(event) => reducer({ block: { ...state.block, match: event.currentTarget.value } })}
                    placeholder="Requester id or name, group id or hit title"
                    value={state.block.match}
                  />
                </div>
                <div className="input-group">
                  <label style={{ color: '#111111' }}>
                    <input
                      type="checkbox"
                      checked={state.block.strict}
                      onChange={(event) => reducer({ block: { ...state.block, strict: event.currentTarget.checked } })}
                      style={{ marginRight: 5 }}
                    />
                    Strict Matching
                  </label>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer" style={{ display: 'block', padding: 15 }}>
            {state.view === 'default' ? (
              <>
                <button type="button" className="btn btn-danger" onClick={onClickDeleteAll}>
                  Delete All
                </button>
                <label className="btn btn-secondary mb-0">
                  Import
                  <input type="file" id="block-list-import" style={{ display: 'none' }} onChange={onChangeImport} />
                </label>
                <button type="button" className="btn btn-secondary" onClick={onClickExport}>
                  Export
                </button>
                <button type="button" className="btn btn-primary" onClick={onClickAdd}>
                  Add
                </button>
              </>
            ) : (
              <>
                {state.view === 'edit' && (
                  <button type="button" className="btn btn-danger" onClick={onClickDelete}>
                    Delete
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={onClickBack}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={onClickSave}>
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function() {
  const react = document.createElement('react');
  document.body.append(react);
  return ReactDOM.createPortal(<BlocksModal />, react);
}
