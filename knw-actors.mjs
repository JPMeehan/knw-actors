import OrganizationData from "./src/module/data/organizationData.mjs"
import OrganizationSheet from "./src/module/sheets/organizationSheet.mjs"
import WarfareData from "./src/module/data/warfareData.mjs"
import WarfareSheet from "./src/module/sheets/warfareSheet.mjs"
import KNWCONFIG from "./src/module/config.mjs"

const moduleID = "knw-actors"
const typeWarfare = "knw-actors.warfare"
const typeOrganization = "knw-actors.warfare"

Hooks.once("init", () => {
  foundry.utils.mergeObject(CONFIG, KNWCONFIG)

  Object.assign(CONFIG.Actor.dataModels, {
    [typeOrganization]: OrganizationData,
    [typeWarfare]: WarfareData,
  })

  Actors.registerSheet("warfare", WarfareSheet, {
    types: [typeWarfare],
    makeDefault: true,
  })

  Actors.registerSheet("organization", OrganizationSheet, {
    types: [typeOrganization],
    makeDefault: true,
  })
})
