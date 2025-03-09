import OrgDevEditor from "./orgDevEditor.mjs";

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
      viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
    });
  }

  /** @override */
  async getData(options) {
    const context = {
      ...super.getData(options),
      actor: this.actor,
      system: this.actor.system,
      skills: Object.entries(this.actor.system.skills).map(([key, skill]) => {
        return {
          key,
          label: game.i18n.localize("KNW.Organization.skills." + key),
          bonus: skill.bonus
        };
      }),
      defenses: Object.entries(this.actor.system.defenses).map(([key, def]) => {
        return {
          key,
          label: game.i18n.localize(
            "KNW.Organization.defenses." + key + ".Label"
          ),
          level: def.level,
          score: def.score,
          choices: CONFIG.KNW.CHOICES[key]
        };
      }),
      powerDieIMG: this.powerDieIMG,
      powerPool: this.getMemberPowerPool()
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
      let decrement = "<a class=\"subtract\"><i class=\"fas fa-minus\"></i></a>";
      if (value === null) {
        value = "<i class=\"fa-solid fa-dice-d20\"></i>";
        tooltip = "KNW.Organization.Powers.Roll";
        decrement = "";
      } else if (value === 0) {
        value = "<i class=\"fa-solid fa-repeat\"></i>";
        tooltip = "KNW.Organization.Powers.Rest";
        decrement = "";
      }
      return {
        id: id,
        name: actor?.name,
        value,
        decrement,
        tooltip: game.i18n.localize(tooltip)
      };
    });
  }

  async _onDropActor(event, data) {
    /**
     * Checks if user does not have
     * owner permission of the organization
     */
    if (super._onDropActor(event, data) === false) return false;

    const dropActor = await fromUuid(data.uuid);
    if (dropActor.pack) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.NoPackActors", {
        localize: true
      });
      return false;
    } else if (
      !foundry.utils.getProperty(dropActor, "system.attributes.prof")
    ) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.NoProf", {
        localize: true
      });
      return false;
    } else if (dropActor.id in this.actor.system.powerPool) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.AlreadyMember", {
        localize: true
      });
      return false;
    }
    this.actor.update({[`system.powerPool.${dropActor.id}`]: null});
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".body .editScore>a", this.#editScore.bind(this));

    html.on("click", ".skills .label.rollable", this.#rollSkill.bind(this));
    html.on("click", ".powerDie.rollable", this.#cyclePowerDie.bind(this));
    html.on(
      "click",
      ".powerPoolList .edit .subtract",
      this.#decrementPowerDie.bind(this)
    );

    ContextMenu.create(this, html, ".powerPoolMember", this.powerPoolItemMenu);
  }

  async #editScore(event) {
    const statGroup = event.currentTarget.dataset.target;
    const context = {
      statGroup
    };
    const orgDevEditor = new OrgDevEditor(this.actor, context);
    orgDevEditor.render(true);
  }

  async #rollSkill(event) {
    const stat = event.currentTarget.dataset.target;
    const validActors = Object.keys(this.actor.system.powerPool)
      .map((memberID) => game.actors.get(memberID))
      .filter((member) => member?.isOwner);

    const formatter = game.i18n.getListFormatter({type: "unit"});
    const skills = CONFIG.KNW.ORGANIZATION.assocSkills[stat].map(s => CONFIG.DND5E.skills[s].label);

    const assocSkillsText = game.i18n.localize("KNW.Organization.skills.Test.AssocSkills") + " " + formatter.format(skills);

    if (validActors.length === 0) {
      ui.notifications.warn("KNW.Organization.skills.Warning.noActors", {
        localize: true
      });
      return;
    }

    const orgUseProf = foundry.applications.fields.createCheckboxInput({
      name: "useProf"
    });
    const orgUseGroup = foundry.applications.fields.createFormGroup({
      input: orgUseProf,
      label: "KNW.Organization.skills.Test.UseProf",
      hint: "KNW.Organization.skills.Test.UseProfHint",
      localize: true,
      classes: ["slim"]
    });

    let actorChoice = "";
    if (validActors.length > 1) {
      const actorSelect = foundry.applications.fields.createSelectInput({
        name: "orgChooseActor",
        options: validActors.map(a => ({value: a.id, label: a.name}))
      });

      const actorGroup = foundry.applications.fields.createFormGroup({
        input: actorSelect,
        label: "KNW.Organization.skills.Test.ChooseActor",
        localize: true,
        classes: ["slim"]
      });

      actorChoice = actorGroup.outerHTML;
    }

    const testInput = await foundry.applications.api.DialogV2.prompt({
      window: {
        title: game.i18n.format("KNW.Organization.skills.Test.Title", {
          skill: game.i18n.localize("KNW.Organization.skills." + stat)
        })
      },
      content: `${actorChoice}${orgUseGroup.outerHTML}<p><em>${assocSkillsText}</em></p>`,
      ok: {
        icon: "fa-solid fa-dice-d20",
        label: "KNW.Organization.skills.Test.Roll",
        callback: (event, button, dialog) => {
          const fd = new FormDataExtended(button.form);
          return {
            chosenActor: game.actors.get(fd.object["orgChooseActor"]) ?? validActors[0],
            useProf: fd.object["useProf"]
          };
        }
      },
      rejectClose: false
    });

    if (testInput) this.actor.system.rollSkillTest(stat, testInput.chosenActor, testInput.useProf, event);
  }

  async #cyclePowerDie(event) {
    const memberID = event.currentTarget.closest("li").dataset.id;
    const currentValue = this.actor.system.powerPool[memberID];
    const memberActor = game.actors.get(memberID);
    switch (currentValue) {
      case null: // Available
        if (memberActor.isOwner) this.actor.system.rollPowerDie(memberID);
        else
          ui.notifications.warn("KNW.Organization.Powers.Warning.MustOwnRoll", {
            localize: true
          });
        break;
      case 0: // Take Extended Rest
        if (memberActor.isOwner)
          this.actor.update({[`system.powerPool.${memberID}`]: null});
        else
          ui.notifications.warn("KNW.Organization.Powers.Warning.MustOwnRest", {
            localize: true
          });
        break;
      default:
        ChatMessage.create({
          user: game.user,
          content: game.i18n.format("KNW.Organization.Powers.TakeValue", {
            currentValue,
            orgName: this.actor.name
          })
        });
        this.actor.update({[`system.powerPool.${memberID}`]: 0});
    }
  }

  async #decrementPowerDie(event) {
    this.actor.system.decrementPowerDie(
      event.currentTarget.closest("li").dataset.id
    );
  }

  get powerPoolItemMenu() {
    return [
      {
        name: game.i18n.localize(
          "KNW.Organization.Powers.ContextMenu.SetValue"
        ),
        icon: "<i class='fas fa-edit'></i>",
        condition: this.isEditable,
        callback: this.setDieValue.bind(this)
      },
      {
        name: game.i18n.localize(
          "KNW.Organization.Powers.ContextMenu.ViewMember"
        ),
        icon: "<i class='fas fa-eye'></i>",
        condition: true,
        callback: this.viewMember.bind(this)
      },
      {
        name: game.i18n.localize(
          "KNW.Organization.Powers.ContextMenu.RemoveMember"
        ),
        icon: "<i class='fas fa-trash'></i>",
        condition: this.isEditable,
        callback: this.deleteMember.bind(this)
      }
    ];
  }

  /**
   * Adjusts the die value
   * @param {HTMLElement[]} JQuery
   */
  async setDieValue([html]) {
    const memberID = html.dataset.id;

    foundry.applications.api.DialogV2.prompt({
      window: {
        title: "KNW.Organization.Powers.ContextMenu.SetValue"
      },
      content: foundry.applications.fields.createNumberInput({
        name: `system.powerPool.${memberID}`,
        min: 0,
        max: this.actor.system.powerDie
      }).outerHTML,
      ok: {
        icon: "fa-solid fa-floppy-disk",
        label: "Save Changes",
        callback: (event, button, dialog) => {
          const fd = new FormDataExtended(button.form);
          this.actor.update(fd.object);
        }
      },
      rejectClose: false
    });
  }

  async viewMember(html) {
    const memberID = html[0].dataset.id;
    const member = game.actors.get(memberID);
    member.sheet.render(true);
  }

  async deleteMember(html) {
    const memberID = html[0].dataset.id;
    const member = game.actors.get(memberID);
    ui.notifications.info(
      game.i18n.format("KNW.Organization.Powers.Warning.RemoveMember", {
        memberName: member?.name,
        organization: this.actor.name
      })
    );
    this.actor.update({[`system.powerPool.-=${memberID}`]: null});
  }
}
