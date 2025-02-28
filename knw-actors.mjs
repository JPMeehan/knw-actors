import OrganizationData from "./src/module/data/organizationData.mjs";
import OrganizationSheet from "./src/module/sheets/organizationSheet.mjs";
import WarfareData from "./src/module/data/warfareData.mjs";
import WarfareSheet from "./src/module/sheets/warfareSheet.mjs";
import KNWCONFIG from "./src/module/config.mjs";
import OrgDevEditor from "./src/module/sheets/orgDevEditor.mjs";
import {warfareTokenBar} from "./src/module/hooks.mjs";

const moduleID = "knw-actors";
const typeWarfare = "knw-actors.warfare";
const typeOrganization = "knw-actors.organization";

Hooks.once("init", () => {
  foundry.utils.mergeObject(CONFIG, KNWCONFIG);

  Handlebars.registerHelper({
    orgDevRangePicker: OrgDevEditor.rangePicker
  });

  Object.assign(CONFIG.Actor.dataModels, {
    [typeOrganization]: OrganizationData,
    [typeWarfare]: WarfareData
  });

  Actors.registerSheet(moduleID, OrganizationSheet, {
    types: [typeOrganization],
    makeDefault: true,
    label: "KNW.Sheets.Organization"
  });

  Actors.registerSheet(moduleID, WarfareSheet, {
    types: [typeWarfare],
    makeDefault: true,
    label: "KNW.Sheets.Warfare"
  });

  CONFIG.statusEffects.push({
    id: "broken",
    name: "KNW.Warfare.Conditions.Broken",
    img: "systems/dnd5e/icons/svg/statuses/incapacitated.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  }, {
    id: "disbanded",
    name: "KNW.Warfare.Conditions.Disbanded",
    img: "systems/dnd5e/icons/svg/statuses/dead.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  }, {
    id: "disorganized",
    name: "KNW.Warfare.Conditions.Disorganized",
    img: "systems/dnd5e/icons/svg/statuses/stunned.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  }, {
    id: "disoriented",
    name: "KNW.Warfare.Conditions.Disoriented",
    img: "modules/knw-actors/assets/icons/disoriented.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  }, {
    id: "exposed",
    name: "KNW.Warfare.Conditions.Exposed",
    img: "modules/knw-actors/assets/icons/exposed.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  }, {
    id: "hidden",
    name: "KNW.Warfare.Conditions.Hidden",
    img: "systems/dnd5e/icons/svg/statuses/hiding.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  }, {
    id: "misled",
    name: "KNW.Warfare.Conditions.Misled",
    img: "systems/dnd5e/icons/svg/statuses/surprised.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  }, {
    id: "weakened",
    name: "KNW.Warfare.Conditions.Weakened",
    img: "systems/dnd5e/icons/svg/statuses/exhaustion.svg",
    hud: {
      actorTypes: [typeWarfare]
    }
  });
});

Hooks.on("ready", () => {
  const actorTypes = Object.keys(game.model.Actor).filter(t => !t.startsWith("knw-actors"));
  for (const status of CONFIG.statusEffects) {
    if ("hud" in status) continue;
    status.hud = {actorTypes};
  }
});

Hooks.on("renderTokenConfig5e", (app, html, context) => {
  switch (app.actor.type) {
    case typeWarfare:
      warfareTokenBar(app, html, context);
      break;
  }
});
