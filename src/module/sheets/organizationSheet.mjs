import OrgDevEditor from "./orgDevEditor.mjs";

const {api, sheets} = foundry.applications;

/**
 * Sheet for Organization type actors
 */
export default class OrganizationSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["dnd5e2", "sheet", "actor", "organization"],
    position: {
      width: 720,
      height: 680
    },
    viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
    actions: {
      editScore: this.#editScore,
      rollSkill: this.#rollSkill,
      cyclePowerDie: this.#cyclePowerDie,
      decrementPowerDie: this.#decrementPowerDie,
      editText: this.#editText
    }
  };

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: "modules/knw-actors/templates/organization/header.hbs"
    },
    body: {
      template: "modules/knw-actors/templates/organization/body.hbs"
    },
    footer: {
      template: "modules/knw-actors/templates/organization/footer.hbs"
    }
  };

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign (context, {
      actor: this.actor,
      system: this.actor.system
    });
    return context;
  }

  /** @inheritdoc */
  async _preparePartContext(partId, context, options) {

    switch (partId) {
      case "header": break;
      case "body":
        Object.assign(context, {
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
        });
        break;
      case "footer":
        await this.footerContext(context);
        break;
    }

    return context;
  }

  /**
   * Adds in footer-specific context
   * @param {object} context
   */
  async footerContext(context) {
    const TextEditor = foundry.applications.ux.TextEditor;

    const enrichmentOptions = {
      secrets: this.actor.isOwner,
      rollData: this.actor.getRollData(),
      relativeTo: this.actor
    };

    Object.assign(context, {
      enrichedPowers: await TextEditor.implementation.enrichHTML(this.actor.system.powers, enrichmentOptions),
      enrichedFeatures: await TextEditor.implementation.enrichHTML(this.actor.system.features, enrichmentOptions)
    });
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

  async _onDropActor(event, actor) {
    if (actor.pack) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.NoPackActors", {
        localize: true
      });
      return false;
    } else if (
      !foundry.utils.getProperty(actor, "system.attributes.prof")
    ) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.NoProf", {
        localize: true
      });
      return false;
    } else if (actor.id in this.actor.system.powerPool) {
      ui.notifications.warn("KNW.Organization.Powers.Warning.AlreadyMember", {
        localize: true
      });
      return false;
    }
    this.actor.update({[`system.powerPool.${actor.id}`]: null});
  }

  /** @inheritdoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);

    this._createContextMenu(this.powerPoolItemMenu, ".powerPoolMember", {
      hookName: "getPowerPoolContextOptions",
      parentClassHooks: false
    });
  }

  powerPoolItemMenu() {
    const getMember = (/** @type {HTMLElement} */ li) => game.actors.get(li.dataset.id);

    return [
      {
        name: "KNW.Organization.Powers.ContextMenu.SetValue",
        icon: "<i class='fas fa-edit'></i>",
        condition: () => this.isEditable,
        callback: li => {
          const memberID = li.dataset.id;

          const updateData = foundry.applications.api.DialogV2.input({
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
              label: "Save Changes"
            },
            rejectClose: false
          });

          if (updateData) this.actor.update(updateData);
        }
      },
      {
        name: "KNW.Organization.Powers.ContextMenu.ViewMember",
        icon: "<i class='fas fa-eye'></i>",
        condition: li => getMember(li).sheet.isVisible,
        callback: li => getMember(li).sheet.render(true)
      },
      {
        name: "KNW.Organization.Powers.ContextMenu.RemoveMember",
        icon: "<i class='fas fa-trash'></i>",
        condition: () => this.isEditable,
        callback: li => {
          const member = getMember(li);
          ui.notifications.info("KNW.Organization.Powers.Warning.RemoveMember", {
            format: {
              memberName: member?.name,
              organization: this.actor.name
            }
          });
          this.actor.update({[`system.powerPool.-=${memberID}`]: null});
        }
      }
    ];
  }

  /* -------------------------------------------- */
  /*  Action Event Handlers                       */
  /* -------------------------------------------- */

  /**
   * Open a helper application to edit the organization's scores
   * @this {OrganizationSheet}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #editScore(event, target) {
    const orgDevEditor = new OrgDevEditor({
      document: this.actor,
      statGroup: target.dataset.target
    });
    orgDevEditor.render({force: true});
  }

  /**
   * Roll a skill for the organization
   * @this {OrganizationSheet}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #rollSkill(event, target) {
    const stat = target.dataset.target;
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

  /**
   * Cycle the power die
   * @this {OrganizationSheet}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #cyclePowerDie(event, target) {
    const memberID = target.closest("li").dataset.id;
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
        foundry.documents.ChatMessage.implementation.create({
          user: game.user,
          content: game.i18n.format("KNW.Organization.Powers.TakeValue", {
            currentValue,
            orgName: this.actor.name
          })
        });
        this.actor.update({[`system.powerPool.${memberID}`]: 0});
    }
  }

  /**
   * Decrease the power die for a member
   * @this {OrganizationSheet}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #decrementPowerDie(event, target) {
    this.actor.system.decrementPowerDie(
      target.closest("li").dataset.id
    );
  }

  /**
   * Open a dialog to edit the powers or features sections
   * @this {OrganizationSheet}
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #editText(event, target) {
    const {fieldName} = target.dataset;
    const field = this.actor.system.schema.getField(fieldName);
    const update = await foundry.applications.api.Dialog.input({
      window: {
        title: `${this.actor.name} ${game.i18n.localize(field.label)}`
      },
      content: field.toInput({value: this.actor.system[fieldName], height: 300}).outerHTML
    });

    if (update) this.actor.update(update);
  }
}
