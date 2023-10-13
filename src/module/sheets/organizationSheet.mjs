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
          choices: CONFIG.KNW.CHOICES.COMMUNICATIONS,
        },
        rlv: {
          label: game.i18n.localize("KNW.Organization.Defenses.rlv.Label"),
          level: this.actor.system.rlv.level,
          score: this.actor.system.rlv.score,
          choices: CONFIG.KNW.CHOICES.RESOLVE,
        },
        rsc: {
          label: game.i18n.localize("KNW.Organization.Defenses.rsc.Label"),
          level: this.actor.system.rsc.level,
          score: this.actor.system.rsc.score,
          choices: CONFIG.KNW.CHOICES.RESOURCES,
        },
      },
      powerDieIMG: this.powerDieIMG,
      powerPool: this.getMemberPowerPool(),
    };
    return context;
  }

  get powerDieIMG() {
    return CONFIG.KNW.CHOICES.SIZE[this.actor.system.size].diePath;
  }

  getMemberPowerPool() {
    return Object.entries(this.actor.system.powerPool).map(([id, value]) => {
      const actor = game.actors.get(id);
      return {
        id: id,
        name: actor?.name,
        value,
      };
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on(
      "click",
      ".powerDie.rollable",
      { actor: this.actor },
      this.#rollPowerDie
    );
    html.on(
      "click",
      ".powerPoolList .edit .add",
      { actor: this.actor, action: "add" },
      this.#updatePowerDie
    );
    html.on(
      "click",
      ".powerPoolList .edit .subtract",
      { actor: this.actor, action: "subtract" },
      this.#updatePowerDie
    );
    html.on(
      "click",
      ".powerPoolList .edit .delete",
      { actor: this.actor, action: "delete" },
      this.#updatePowerDie
    );
    html.on(
      "click",
      ".skills .label.rollable",
      { actor: this.actor },
      this.#rollStat
    );
    html.on(
      "click",
      "a.item-edit",
      { actor: this.actor },
      this.#editPowerFeature
    );
  }

  async #rollPowerDie(event) {
    event.data.actor.system.rollPowerDie(this.parentElement.dataset.id);
  }

  async #updatePowerDie(event) {
    const thisActor = event.data.actor;
    const actorID = this.parentElement.parentElement.dataset.id;
    const powerPool = thisActor.system.powerPool;
    const currentValue = powerPool[actorID];
    switch (event.data.action) {
      case "add":
        thisActor.update({
          ["system.powerPool." + actorID]: Math.min(
            currentValue + 1,
            thisActor.system.powerDie
          ),
        });
        break;
      case "subtract":
        thisActor.update({
          ["system.powerPool." + actorID]: Math.max(currentValue - 1, 0),
        });
        break;
      case "delete":
        thisActor.update({
          ["system.powerPool." + actorID]: null,
        });
    }
  }

  async #rollStat(event) {
    const stat = event.currentTarget.dataset.target;
    event.data.actor.system.rollSkillTest(stat);
    // const path = "system." + stat;
    // const label = game.i18n.localize(`KNW.Warfare.Statistics.${stat}.long`);
    // const prof = 2
    // const roll = game.dnd5e.dice.d20Roll({
    //   parts: ["@stat", "@prof"],
    //   data: {
    //     stat: foundry.utils.getProperty(event.data.actor, path),
    //     prof
    //   },
    //   title: game.i18n.format("KNW.Warfare.Statistics.Test", { stat: label }),
    //   event,
    //   // messageData: {
    //   //   speaker: ChatMessage.getSpeaker({ actor: event.data.actor }),
    //   // },
    // });
    // console.log(await roll);
  }

  async #editPowerFeature(event) {
    const target = event.currentTarget.dataset.target;
    console.log(target);
  }
}
