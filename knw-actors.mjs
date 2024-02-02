import OrganizationData from './src/module/data/organizationData.mjs';
import OrganizationSheet from './src/module/sheets/organizationSheet.mjs';
import WarfareData from './src/module/data/warfareData.mjs';
import WarfareSheet from './src/module/sheets/warfareSheet.mjs';
import KNWCONFIG from './src/module/config.mjs';
import OrgDevEditor from './src/module/sheets/orgDevEditor.mjs';

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
