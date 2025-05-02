const {api, sheets} = foundry.applications;

/**
 * Sheet for Warfare type actors
 */
export default class WarfareSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["dnd5e2", "sheet", "actor", "warfare"],
    position: {
      width: 600,
      height: 380
    },
    actions: {
      rollStat: this.#rollStat,
      configureTraits: this.#configureTraits,
      controlEmbedded: this.#handleEmbeddedDocumentControl,
      createEmbedded: this.#createActiveEffect
    }
  };

  static PARTS = {
    header: {
      template: "modules/knw-actors/templates/warfare/header.hbs"
    },
    body: {
      template: "modules/knw-actors/templates/warfare/body.hbs"
    },
    footer: {
      template: "modules/knw-actors/templates/warfare/footer.hbs"
    }
  };

  static TABS = {
    primary: {
      tabs: [
        {
          id: "traits",
          label: "KNW.Warfare.Traits.SheetLabel"
        },
        {
          id: "items",
          label: "DOCUMENT.Items"
        },
        {
          id: "effects",
          label: "DOCUMENT.ActiveEffects"
        }
      ],
      initial: "traits"
    }
  };

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign (context, {
      actor: this.actor,
      system: this.actor.system,
      choices: CONFIG.KNW.CHOICES
    });
    return context;
  }

  /** @inheritdoc */
  _preparePartContext(partId, context, options) {
    switch (partId) {
      case "header":
        context.typeImage = this.typeImage;
        break;
      case "body":
        context.coreStats = {
          atk: {
            label: game.i18n.localize("KNW.Warfare.Statistics.atk.abbr"),
            value: this.actor.system.atk.signedString(),
            rollable: this.isEditable
          },
          def: {
            label: game.i18n.localize("KNW.Warfare.Statistics.def.abbr"),
            value: this.actor.system.def
          },
          pow: {
            label: game.i18n.localize("KNW.Warfare.Statistics.pow.abbr"),
            value: this.actor.system.pow.signedString(),
            rollable: this.isEditable
          },
          tou: {
            label: game.i18n.localize("KNW.Warfare.Statistics.tou.abbr"),
            value: this.actor.system.tou
          },
          mor: {
            label: game.i18n.localize("KNW.Warfare.Statistics.mor.abbr"),
            value: this.actor.system.mor.signedString(),
            rollable: this.isEditable
          },
          com: {
            label: game.i18n.localize("KNW.Warfare.Statistics.com.abbr"),
            value: this.actor.system.com.signedString(),
            rollable: this.isEditable
          }
        };
        break;
      case "footer":
        context.traits = this.traits;
        context.items = this.actor.items.contents.sort((a, b) => a.sort - b.sort);
        context.effects = this.actor.effects.contents.sort((a, b) => a.sort - b.sort);
        break;
    }
    return context;
  }

  /**
   * @returns {string[] | null} An array of traits to display
   */
  get traits() {
    const traits = this.actor.system.traitList.split(";").map((e) => e.trim());
    return (traits.length === 1) && !traits[0] ? null : traits;
  }

  /**
   * @returns {string} The image path
   */
  get typeImage() {
    const system = this.actor.system;
    if ((system.type === "infantry") && (system.experience === "levy"))
      return "modules/knw-actors/assets/icons/levy.png";
    else return CONFIG.KNW.CHOICES.TYPE[system.type].img;
  }

  /** @inheritdoc */
  async _onDropActor(event, actor) {
    if (actor.pack) {
      ui.notifications.warn("KNW.Warfare.Commander.Warning.Pack", {
        localize: true
      });
      return false;
    } else if (
      !foundry.utils.hasProperty(actor, "system.attributes.prof")
    ) {
      ui.notifications.warn("KNW.Warfare.Commander.Warning.NoProf", {
        localize: true
      });
      return false;
    }
    return this.actor.update({"system.commander": actor.id});
  }

  /** @inheritdoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);

    this._createContextMenu(this.commanderMenu, ".commander .name", {
      hookName: "getCommanderContextOptions",
      parentClassHooks: false,
      fixed: true
    });
  }

  /* -------------------------------------------- */
  /*  Action Event Handlers                       */
  /* -------------------------------------------- */

  /**
   * Roll a Warfare skill
   * @this WarfareSheet
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #rollStat(event, target) {
    const {stat} = target.dataset;
    this.actor.system.rollStat(stat, event);
  }

  /**
   * Edit the traits of the unit
   * @this WarfareSheet
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #configureTraits(event, target) {
    const traitInput = foundry.applications.fields.createTextareaInput({
      name: "system.traitList",
      value: this.actor.system.traitList,
      placeholder: "Adaptable; Stalwart",
      rows: 3
    });

    const traitGroup = foundry.applications.fields.createFormGroup({
      input: traitInput,
      label: "",
      hint: "KNW.Warfare.Traits.Instructions",
      localize: true,
      classes: ["stacked"]
    });

    const update = await foundry.applications.api.Dialog.input({
      window: {
        title: "KNW.Warfare.Traits.DialogTitle"
      },
      content: traitGroup.outerHTML,
      ok: {
        label: "SAVE",
        icon: "fa-solid fa-floppy-disk"
      },
      rejectClose: false
    });

    if (update) this.actor.update(update);
  }

  /**
   * Handles item and effect controls
   * @this WarfareSheet
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #handleEmbeddedDocumentControl(event, target) {
    const li = target.closest("li");
    const {embeddedName, itemId, effectId} = li.dataset;
    const doc = this.actor.getEmbeddedDocument(embeddedName, itemId || effectId);
    switch (target.dataset.control) {
      case "edit":
        doc.sheet.render(true);
        break;
      case "delete":
        doc.deleteDialog();
        break;
      case "toggle":
        doc.update({disabled: !doc.disabled});
        break;
    }
  }

  /**
   * Handles item and effect creation
   * @this WarfareSheet
   * @param {PointerEvent} event  The originating click event
   * @param {HTMLElement} target  The capturing HTML element which defines the [data-action]
   */
  static async #createActiveEffect(event, target) {
    this.actor.createEmbeddedDocuments(target.dataset.embeddedName, [{
      name: getDocumentClass("ActiveEffect").defaultName({parent: this.actor}),
      img: "icons/svg/aura.svg"
    }]);
  }

  /**
   * Constructs context menu options for the commander
   * @returns {import("@client/applications/ux/context-menu.mjs").ContextMenuEntry[]}
   */
  commanderMenu() {
    return [
      {
        name: game.i18n.localize("KNW.Warfare.Commander.View"),
        icon: "<i class='fas fa-eye'></i>",
        condition: () => this.actor.system.commander,
        callback: () => this.actor.system.commander.sheet.render(true)
      },
      {
        name: game.i18n.localize("KNW.Warfare.Commander.Clear"),
        icon: "<i class='fas fa-trash'></i>",
        condition: this.isEditable && this.actor.system.commander,
        callback: () => this.clearCommander()
      }
    ];
  }

  async clearCommander() {
    const commander = this.actor.system.commander;
    ui.notifications.info(
      game.i18n.format("KNW.Warfare.Commander.Warning.Remove", {
        commanderName: commander.name,
        warfareUnit: this.actor.name
      })
    );
    this.actor.update({"system.commander": ""});
  }
}
