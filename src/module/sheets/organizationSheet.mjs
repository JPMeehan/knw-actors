export default class OrganizationSheet extends ActorSheet {
  /** @override */
  get template() {
    return "modules/knw-actors/templates/organization-sheet.hbs";
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "actor", "organization"],
      width: 720,
      height: 680,
    });
  }

  /** @override */
  async getData(options) {
    const context = {
      ...super.getData(options),
      actor: this.actor,
      system: this.actor.system,
      skills: {
        dip: {
          label: game.i18n.localize("KNW.Organization.Skills.dip"),
          value: this.actor.system.dip,
        },
        esp: {
          label: game.i18n.localize("KNW.Organization.Skills.esp"),
          value: this.actor.system.esp,
        },
        lor: {
          label: game.i18n.localize("KNW.Organization.Skills.lor"),
          value: this.actor.system.lor,
        },
        opr: {
          label: game.i18n.localize("KNW.Organization.Skills.opr"),
          value: this.actor.system.opr,
        },
      },
      defenses: {
        com: {
          label: game.i18n.localize("KNW.Organization.Defenses.com.Label"),
          level: this.actor.system.com.level,
          score: this.actor.system.com.score,
          choices: CONFIG.KNW.CHOICES.COMMUNICATIONS
        },
        rlv: {
          label: game.i18n.localize("KNW.Organization.Defenses.rlv.Label"),
          level: this.actor.system.rlv.level,
          score: this.actor.system.rlv.score,
          choices: CONFIG.KNW.CHOICES.RESOLVE
        },
        rsc: {
          label: game.i18n.localize("KNW.Organization.Defenses.rsc.Label"),
          level: this.actor.system.rsc.level,
          score: this.actor.system.rsc.score,
          choices: CONFIG.KNW.CHOICES.RESOURCES
        },
      },
      powerDieIMG: this.powerDieIMG,
    };
    return context;
  }

  get powerDieIMG() {
    return CONFIG.KNW.CHOICES.SIZE[this.actor.system.size].diePath;
  }
}
