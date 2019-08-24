import React, { useState, ChangeEvent } from 'react';

export function BlockListModal() {
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState('');
  const [match, setMatch] = useState('');
  const [strict, setStrict] = useState(true);

  function onClickAdd() {
    setAdd(true);
  }

  function onClickEdit() {
    setEdit(true);
  }

  function onClickSave() {
    setAdd(false);
    setEdit(false);
  }

  function onClickResetState() {
    setAdd(false);
    setEdit(false);
    setName('');
    setMatch('');
    setStrict(true);
  }

  function onChangeName(event: ChangeEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  function onChangeMatch(event: ChangeEvent<HTMLInputElement>) {
    setMatch(event.currentTarget.value);
  }

  function onChangeStrict(event: ChangeEvent<HTMLInputElement>) {
    setStrict(event.currentTarget.checked);
  }

  return (
    <div className="modal fade in" id="block-list-modal" style={{ marginTop: 60 }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Block List</h2>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              onClick={onClickResetState}
              style={{ marginRight: 0 }}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            {!add && !edit && <h2 className="modal-title">Block List Items</h2>}

            {(add || edit) && (
              <>
                <div className="input-group m-b-sm">
                  <span className="input-group-addon" id="basic-addon1">
                    Name
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    disabled={edit}
                    onChange={onChangeName}
                    placeholder="Nickname for the block"
                    value={name}
                  />
                </div>
                <div className="input-group m-b-sm">
                  <span className="input-group-addon" id="basic-addon1">
                    Match
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    disabled={edit}
                    onChange={onChangeMatch}
                    placeholder="Requester id or name, group id or hit title"
                    value={match}
                  />
                </div>
                <div className="input-group">
                  <label style={{ color: '#111111' }}>
                    <input type="checkbox" checked={strict} onChange={onChangeStrict} style={{ marginRight: 5 }} />
                    Strict Matching
                  </label>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer" style={{ display: 'block', padding: 15 }}>
            {!add && !edit && (
              <>
                <button type="button" className="btn btn-danger">
                  Delete All
                </button>
                <button type="button" className="btn btn-secondary">
                  Import
                </button>
                <button type="button" className="btn btn-secondary">
                  Export
                </button>
                <button type="button" className="btn btn-primary" onClick={onClickAdd}>
                  Add
                </button>
              </>
            )}

            {(add || edit) && (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClickResetState}>
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
