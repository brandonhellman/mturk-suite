import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tab from 'react-bootstrap/Tab';

import { selectOptions } from '../../../store/options/selectors';
import { optionsUpdateScripts } from '../../../store/options/actions';
import { Checkbox } from '../../../components/Checkbox';

export function OptionsPane() {
  const dispatch = useDispatch();
  const options = useSelector(selectOptions);

  return (
    <Tab.Pane className="p-1" eventKey="options">
      <h5>Scripts</h5>

      <Checkbox
        label="Auto Accept Unchecker"
        checked={options.scripts.autoAcceptUnchecker}
        onChange={() => dispatch(optionsUpdateScripts('autoAcceptUnchecker'))}
      />

      <Checkbox
        label="Block List"
        checked={options.scripts.blockList}
        onChange={() => dispatch(optionsUpdateScripts('blockList'))}
      />

      <Checkbox
        label="Confirm Return Hit"
        checked={options.scripts.confirmReturnHit}
        onChange={() => dispatch(optionsUpdateScripts('confirmReturnHit'))}
      />

      <Checkbox
        label="Hit Exporter"
        checked={options.scripts.hitExporter}
        onChange={() => dispatch(optionsUpdateScripts('hitExporter'))}
      />

      <Checkbox
        label="MTS HIT Tracker"
        checked={options.scripts.mtsHitTracker}
        onChange={() => dispatch(optionsUpdateScripts('mtsHitTracker'))}
      />

      <Checkbox
        label="Pagination Last Page"
        checked={options.scripts.paginationLastPage}
        onChange={() => dispatch(optionsUpdateScripts('paginationLastPage'))}
      />

      <Checkbox
        label="Queue Info Enhancer"
        checked={options.scripts.queueInfoEnhancer}
        onChange={() => dispatch(optionsUpdateScripts('queueInfoEnhancer'))}
      />

      <Checkbox
        label="Rate Limit Reloader"
        checked={options.scripts.rateLimitReloader}
        onChange={() => dispatch(optionsUpdateScripts('rateLimitReloader'))}
      />

      <Checkbox
        label="Turkerview"
        checked={options.scripts.turkerview}
        onChange={() => dispatch(optionsUpdateScripts('turkerview'))}
      />

      <Checkbox
        label="Turkopticon"
        checked={options.scripts.turkopticon}
        onChange={() => dispatch(optionsUpdateScripts('turkopticon'))}
      />

      <Checkbox
        label="Workspace Expander"
        checked={options.scripts.workspaceExpander}
        onChange={() => dispatch(optionsUpdateScripts('workspaceExpander'))}
      />
    </Tab.Pane>
  );
}
