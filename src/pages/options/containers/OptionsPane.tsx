import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tab from 'react-bootstrap/Tab';

import { selectOptions } from '../../../store/options/selectors';
import { optionsUpdateScripts } from '../../../store/options/actions';
import { OptionsUpdateScriptsAction } from '../../../store/options/types';
import { Checkbox } from '../../../components/Checkbox';

export function OptionsPane() {
  const dispatch = useDispatch();
  const options = useSelector(selectOptions);

  function onChangeScripts(
    event: React.ChangeEvent<HTMLInputElement>,
    key: OptionsUpdateScriptsAction['payload']['key'],
  ) {
    dispatch(optionsUpdateScripts({ key, value: event.target.checked }));
  }

  return (
    <Tab.Pane className="p-1" eventKey="options">
      <h5>Scripts</h5>

      <Checkbox
        label="Confirm Return Hit"
        checked={options.scripts.confirmReturnHit}
        onChange={(event) => onChangeScripts(event, 'confirmReturnHit')}
      />

      <Checkbox
        label="Pagination Last Page"
        checked={options.scripts.paginationLastPage}
        onChange={(event) => onChangeScripts(event, 'paginationLastPage')}
      />

      <Checkbox
        label="Rate Limit Reloader"
        checked={options.scripts.rateLimitReloader}
        onChange={(event) => onChangeScripts(event, 'rateLimitReloader')}
      />
    </Tab.Pane>
  );
}
