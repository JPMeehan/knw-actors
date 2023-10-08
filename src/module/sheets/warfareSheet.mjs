export default class WarfareSheet extends ActorSheet {
  /** @override */
  get template() {
    return "modules/knw-actors/templates/warfare-sheet.hbs"
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "actor", "warfare"],
      width: 600,
      height: 360,
    })
  }

  /** @override */
  async getData(options) {
    const context = {
      ...super.getData(options),
      actor: this.actor,
      system: this.actor.system,
      coreStats: {
        atk: {
          label: game.i18n.localize("KNW.Warfare.Statistics.atk.abbr"),
          value: this.actor.system.atk,
          rollable: "rollable",
        },
        def: {
          label: game.i18n.localize("KNW.Warfare.Statistics.def.abbr"),
          value: this.actor.system.def,
        },
        pow: {
          label: game.i18n.localize("KNW.Warfare.Statistics.pow.abbr"),
          value: this.actor.system.pow,
          rollable: "rollable",
        },
        tou: {
          label: game.i18n.localize("KNW.Warfare.Statistics.tou.abbr"),
          value: this.actor.system.tou,
        },
        mor: {
          label: game.i18n.localize("KNW.Warfare.Statistics.mor.abbr"),
          value: this.actor.system.mor,
          rollable: "rollable",
        },
        com: {
          label: game.i18n.localize("KNW.Warfare.Statistics.com.abbr"),
          value: this.actor.system.com,
          rollable: "rollable",
        },
      },
      choices: CONFIG.KNW.CHOICES,
    }
    context.traits = this.actor.system.traits.split(";").map((e) => e.trim())
    if (context.traits.length === 1 && !context.traits[0]) context.traits = null
    return context
  }
}
