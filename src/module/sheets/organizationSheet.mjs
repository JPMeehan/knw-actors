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
          value: skill.value,
        };
      }),
      defenses: Object.entries(this.actor.system.defenses).map(
        ([key, value]) => {
          return {
            key,
            label: game.i18n.localize(
              "KNW.Organization.defenses." + key + ".Label"
            ),
            level: value.level,
            score: value.score,
            choices: CONFIG.KNW.CHOICES[key],
          };
        }
      ),
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
      let decrement = `<a class="subtract"><i class="fas fa-minus"></i></a>`;
      if (value === null) {
        value = '<i class="fa-solid fa-dice-d20"></i>';
        tooltip = "KNW.Organization.Powers.Roll";
        decrement = "";
      } else if (value === 0) {
        value = '<i class="fa-solid fa-repeat"></i>';
        tooltip = "KNW.Organization.Powers.Rest";
        decrement = "";
      }
      return {
        id: id,
        name: actor?.name,
        value,
        decrement,
        tooltip: game.i18n.localize(tooltip),
      };
    });
  }

  async _onDropActor(event, data) {
    // Returns false if user does not have
    super._onDropActor(event, data);
    // owners permissions of the organization
    const dropActor = await fromUuid(data.uuid);
    if (dropActor.pack) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.NoPackActors", {
        localize: true,
      });
      return false;
    } else if (
      !foundry.utils.getProperty(dropActor, "system.attributes.prof")
    ) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.NoProf", {
        localize: true,
      });
      return false;
    } else if (this.actor.system.powerPool.hasOwnProperty(dropActor.id)) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.AlreadyMember", {
        localize: true,
      });
      return false;
    }
    this.actor.update({ [`system.powerPool.${dropActor.id}`]: null });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on(
      "click",
      ".body .editScore>a",
      { actor: this.actor },
      this.#editScore
    );

    html.on(
      "click",
      ".skills .label.rollable",
      { actor: this.actor },
      this.#rollSkill
    );
    html.on(
      "click",
      ".powerDie.rollable",
      { actor: this.actor },
      this.#cyclePowerDie
    );
    html.on(
      "click",
      ".powerPoolList .edit .subtract",
      { actor: this.actor },
      this.#decrementPowerDie
    );

    ContextMenu.create(this, html, ".powerPoolMember", this.powerPoolItemMenu);
  }

  async #editScore(event) {
    const thisActor = event.data.actor;
    const statGroup = event.currentTarget.dataset.target;
    const context = {
      statGroup,
    };
    const orgDevEditor = new OrgDevEditor(thisActor, context);
    orgDevEditor.render(true);
  }

  async #rollSkill(event) {
    const stat = event.currentTarget.dataset.target;
    const thisActor = event.data.actor;
    const validActors = Object.keys(thisActor.system.powerPool)
      .map((memberID) => game.actors.get(memberID))
      .filter((member) => member.isOwner);

    if (validActors.length === 0)
      ui.notifications.warn("KNW.Organization.skills.Warning.noActors", {
        localize: true,
      });
    else if (validActors.length === 1)
      thisActor.system.rollSkillTest(stat, validActors[0]);
    else {
      const selectOptions = validActors.map((actor) => ({
        memberID: actor.id,
        memberName: actor.name,
      }));

      const assocSkillsText = CONFIG.KNW.ORGANIZATION.assocSkills[stat].reduce(
        (accumulator, currentValue, currentIndex, array) => {
          return (
            accumulator +
            " " +
            CONFIG.DND5E.skills[currentValue].label +
            (currentIndex === array.length - 1 ? "" : ",")
          );
        },
        game.i18n.localize("KNW.Organization.skills.Test.AssocSkills")
      );

      const chosenActor = await Dialog.wait({
        title: game.i18n.format("KNW.Organization.skills.Test.Title", {
          skill: game.i18n.localize("KNW.Organization.skills." + stat),
        }),
        content: `<label class="orgChooseActorLabel">${game.i18n.localize(
          "KNW.Organization.skills.Test.DialogContent"
        )}
        <select class='orgChooseActor'>
        ${Handlebars.helpers.selectOptions(selectOptions, {
          hash: { nameAttr: "memberID", labelAttr: "memberName" },
        })}
        </select></label>
        <p><em>${assocSkillsText}</em></p>`,
        buttons: {
          default: {
            icon: '<i class="fa-solid fa-floppy-disk"></i>',
            label: game.i18n.localize("KNW.Organization.skills.Test.Roll"),
            callback: (html) => {
              return game.actors.get(html.find(".orgChooseActor")[0].value);
            },
          },
        },
      });
      if (chosenActor) thisActor.system.rollSkillTest(stat, chosenActor);
    }
  }

  async #cyclePowerDie(event) {
    const memberID = this.parentElement.dataset.id;
    const thisActor = event.data.actor;
    const currentValue = thisActor.system.powerPool[memberID];
    switch (currentValue) {
      case null: // Available
        thisActor.system.rollPowerDie(memberID);
        break;
      case 0: // Take Extended Rest
        thisActor.update({ [`system.powerPool.${memberID}`]: null });
        break;
      default:
        ChatMessage.create({
          user: game.user,
          content: game.i18n.format("KNW.Organization.Powers.TakeValue", {
            currentValue,
            orgName: thisActor.name,
          }),
        });
        thisActor.update({ [`system.powerPool.${memberID}`]: 0 });
    }
  }

  async #decrementPowerDie(event) {
    event.data.actor.system.decrementPowerDie(
      this.parentElement.parentElement.dataset.id
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
        callback: (html) => this.setDieValue(html, this.actor),
      },
      {
        name: game.i18n.localize(
          "KNW.Organization.Powers.ContextMenu.ViewMember"
        ),
        icon: "<i class='fas fa-eye'></i>",
        condition: true,
        callback: this.viewMember,
      },
      {
        name: game.i18n.localize(
          "KNW.Organization.Powers.ContextMenu.RemoveMember"
        ),
        icon: "<i class='fas fa-trash'></i>",
        condition: this.isEditable,
        callback: (html) => this.deleteMember(html, this.actor),
      },
    ];
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
    ui.notifications.info(
      game.i18n.format("KNW.Organization.Powers.Warning.RemoveMember", {
        memberName: member.name,
        organization: thisActor.name,
      })
    );
    thisActor.update({ [`system.powerPool.-=${memberID}`]: null });
  }
}
