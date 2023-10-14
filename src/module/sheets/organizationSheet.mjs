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
    return Object.entries(this.actor.system.powerPool).map(([id, current]) => {
      const actor = game.actors.get(id);
      let value = current;
      let tooltip = "KNW.Organization.Powers.Take";
      if (value === undefined) {
        value = '<i class="fa-solid fa-dice-d20"></i>';
        tooltip = "KNW.Organization.Powers.Roll";
      } else if (value === null) {
        value = '<i class="fa-solid fa-repeat"></i>';
        tooltip = "KNW.Organization.Powers.Rest";
      }
      return {
        id: id,
        name: actor?.name,
        value,
        tooltip: game.i18n.localize(tooltip),
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
      ".powerPoolList .edit .subtract",
      { actor: this.actor, action: "subtract" },
      this.#updatePowerDie
    );
    html.on(
      "click",
      ".skills .label.rollable",
      { actor: this.actor },
      this.#rollSkill
    );
    html.on(
      "click",
      "a.item-edit",
      { actor: this.actor },
      this.#editPowerFeature
    );

    const powerPoolItemMenu = [
      {
        name: game.i18n.localize("KNW.Organization.Powers.SetValue"),
        icon: "<i class='fas fa-edit'></i>",
        condition: this.isEditable,
        callback: (html) => this.setDieValue(html, this.actor),
      },
      {
        name: game.i18n.localize("KNW.Organization.Powers.ViewMember"),
        icon: "<i class='fas fa-eye'></i>",
        condition: true,
        callback: this.viewMember,
      },
      {
        name: game.i18n.localize("KNW.Organization.Powers.RemoveMember"),
        icon: "<i class='fas fa-trash'></i>",
        condition: this.isEditable,
        callback: (html) => this.deleteMember(html, this.actor),
      },
    ];

    ContextMenu.create(this, html, ".powerPoolMember", powerPoolItemMenu);
  }

  async #rollPowerDie(event) {
    event.data.actor.system.rollPowerDie(this.parentElement.dataset.id);
  }

  async #updatePowerDie(event) {
    event.data.actor.system.editPowerDie(
      this.parentElement.parentElement.dataset.id,
      event.data.action
    );
  }

  async setDieValue(html, thisActor) {
    const memberID = html[0].dataset.id;

    new Dialog({
      title: game.i18n.localize("KNW.Organization.Powers.SetValue"),
      content: Handlebars.helpers.numberInput(
        thisActor.system.powerPool[memberID],
        { hash: { class: "powerDie", min: 0, max: thisActor.system.powerDie } }
      ).string,
      buttons: {
        default: {
          icon: '<i class="fa-solid fa-floppy-disk"></i>',
          label: game.i18n.localize("Save Changes"),
          callback: (dialogHTML) => {
            const newValue = dialogHTML.find(".powerDie")[0].value
              ? dialogHTML.find(".powerDie")[0].value
              : null;
            thisActor.update({
              [`system.powerPool.${memberID}`]: newValue,
            });
          },
        },
      },
    }).render(true);
  }

  async viewMember(html) {
    const memberID = html[0].dataset.id;
    const member = game.actors.get(memberID);
    member.sheet.render(true);
  }

  async deleteMember(html, thisActor) {
    const memberID = html[0].dataset.id;
    const member = game.actors.get(memberID);
    ui.notifications.info(`Removed ${member.name} from ${thisActor.name}`);
    // thisActor.update({ [`system.powerPool.-=${memberID}`]: null });
  }

  async #rollSkill(event) {
    const stat = event.currentTarget.dataset.target;
    const thisActor = event.data.actor;
    const validActors = Object.keys(thisActor.system.powerPool).reduce(
      (accumulator, actorID) => {
        const actor = game.actors.get(actorID);
        if (actor.isOwner) accumulator.push(actor);
      },
      []
    );
    if (validActors.length === 0)
      ui.notifications.warn("KNW.Organization.Skills.Warning.noActors");
    else if (validActors.length === 1)
      thisActor.system.rollSkillTest(stat, validActors[0]);
    else {
      const chosenActor = Dialog.wait({
        title: game.i18n.localize("KNW.Organization.Skills.ChooseActor"),
        content: `<select id='orgChooseActor'>
        ${Handlebars.helpers.selectOptions()}
        </select>`,
        buttons: {
          default: {
            icon: '<i class="fa-solid fa-floppy-disk"></i>',
            label: game.i18n.localize("KNW.Organization.Skills.RollTest"),
            callback: (html) => {
              return game.actors.get(html.find("#orgChooseActor")[0].value);
            },
          },
        },
      });
      if (chosenActor) thisActor.system.rollSkillTest(stat, chosenActor);
    }
  }

  async #editPowerFeature(event) {
    const target = event.currentTarget.dataset.target;
    console.log(target);
  }
}
