import OrganizationData from './src/module/data/organizationData.mjs';
import OrganizationSheet from './src/module/sheets/organizationSheet.mjs';
import WarfareData from './src/module/data/warfareData.mjs';
import WarfareSheet from './src/module/sheets/warfareSheet.mjs';
import KNWCONFIG from './src/module/config.mjs';
import OrgDevEditor from './src/module/sheets/orgDevEditor.mjs';
import { warfareTokenBar } from './src/module/hooks.mjs';

const moduleID = 'knw-actors';
const typeWarfare = 'knw-actors.warfare';
const typeOrganization = 'knw-actors.organization';

Hooks.once('init', () => {
  foundry.utils.mergeObject(CONFIG, KNWCONFIG);

  Handlebars.registerHelper({
    orgDevRangePicker: OrgDevEditor.rangePicker,
  });

  Object.assign(CONFIG.Actor.dataModels, {
    [typeOrganization]: OrganizationData,
    [typeWarfare]: WarfareData,
  });

  Actors.registerSheet(moduleID, OrganizationSheet, {
    types: [typeOrganization],
    makeDefault: true,
    label: 'KNW.Sheets.Organization',
  });

  Actors.registerSheet(moduleID, WarfareSheet, {
    types: [typeWarfare],
    makeDefault: true,
    label: 'KNW.Sheets.Warfare',
  });
});

Hooks.on('renderTokenConfig5e', (app, html, context) => {
  switch (app.actor.type) {
    case typeWarfare:
      warfareTokenBar(app, html, context);
      break;
  }
});
