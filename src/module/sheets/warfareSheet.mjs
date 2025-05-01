export default class WarfareSheet extends ActorSheet {
  /** @inheritdoc */
  get template() {
    return "modules/knw-actors/templates/warfare-sheet.hbs";
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "actor", "warfare"],
      width: 600,
      height: 360,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".tabs-body",
          initial: "traits"
        }
      ]
    });
  }

  /** @inheritdoc */
  async getData(options) {
    const context = {
      ...super.getData(options),
      actor: this.actor,
      system: this.actor.system,
      coreStats: {
        atk: {
          label: game.i18n.localize("KNW.Warfare.Statistics.atk.abbr"),
          value: this.actor.system.atk.signedString(),
          rollable: this.isEditable ? "rollable" : ""
        },
        def: {
          label: game.i18n.localize("KNW.Warfare.Statistics.def.abbr"),
          value: this.actor.system.def
        },
        pow: {
          label: game.i18n.localize("KNW.Warfare.Statistics.pow.abbr"),
          value: this.actor.system.pow.signedString(),
          rollable: this.isEditable ? "rollable" : ""
        },
        tou: {
          label: game.i18n.localize("KNW.Warfare.Statistics.tou.abbr"),
          value: this.actor.system.tou
        },
        mor: {
          label: game.i18n.localize("KNW.Warfare.Statistics.mor.abbr"),
          value: this.actor.system.mor.signedString(),
          rollable: this.isEditable ? "rollable" : ""
        },
        com: {
          label: game.i18n.localize("KNW.Warfare.Statistics.com.abbr"),
          value: this.actor.system.com.signedString(),
          rollable: this.isEditable ? "rollable" : ""
        }
      },
      choices: CONFIG.KNW.CHOICES,
      traits: this.traits,
      typeImage: this.typeImage
    };
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

  /**
   * @returns {Promise<Actor | false>} This sheet's actor
   * @inheritdoc
   */
  async _onDropActor(event, data) {
    // Returns false if user does not have owners permissions of the unit
    if (!super._onDropActor(event, data)) return false;

    const dropActor = await fromUuid(data.uuid);
    if (dropActor.pack) {
      ui.notifications.warn("KNW.Warfare.Commander.Warning.Pack", {
        localize: true
      });
      return false;
    } else if (
      !foundry.utils.hasProperty(dropActor, "system.attributes.prof")
    ) {
      ui.notifications.warn("KNW.Warfare.Commander.Warning.NoProf", {
        localize: true
      });
      return false;
    }
    return this.actor.update({"system.commander": dropActor.id});
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.on(
      "click",
      ".coreStat .label.rollable",
      this.#rollStat.bind(this)
    );
    html.on(
      "click",
      ".traitList",
      this._configureTraits.bind(this)
    );
    html.on(
      "click",
      ".item-control",
      {collectionName: "items", idPath: "itemId"},
      this.#handleEmbeddedDocumentControl.bind(this)
    );
    html.on(
      "click",
      ".effect-control",
      {collectionName: "effects", idPath: "effectId"},
      this.#handleEmbeddedDocumentControl.bind(this)
    );
    html.on(
      "click",
      ".effect-create",
      {className: "ActiveEffect"},
      this.#handleEmbeddedDocumentCreate.bind(this)
    );

    ContextMenu.create(this, html, ".commander .name", this.commanderMenu);
  }

  /**
   * Roll a Warfare skill
   * @param {PointerEvent} event
   */
  async #rollStat(event) {
    const stat = event.currentTarget.dataset.target;
    this.actor.system.rollStat(stat, event);
  }

  /**
   * Edit the traits of the unit
   * @param {MouseEvent} event Click event
   */
  async _configureTraits(event) {

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

    const update = await foundry.applications.api.DialogV2.prompt({
      window: {
        title: "KNW.Warfare.Traits.DialogTitle"
      },
      content: traitGroup.outerHTML,
      ok: {
        label: "SAVE",
        icon: "fa-solid fa-floppy-disk",
        callback: (event, button, dialog) => {
          const fd = new FormDataExtended(button.form);
          return fd.object;
        }
      },
      rejectClose: false
    });

    if (update) this.actor.update(update);
  }

  /**
   * Handles item and effect controls
   * @param {MouseEvent} event Click Event
   */
  async #handleEmbeddedDocumentControl(event) {
    const action = event.currentTarget.dataset.action;
    const documentId =
      event.currentTarget.closest("li").dataset[event.data.idPath];
    const doc =
      this.actor.collections[event.data.collectionName].get(documentId);
    switch (action) {
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
   * @param {MouseEvent} event Click Event
   */
  async #handleEmbeddedDocumentCreate(event) {
    const documentClass = getDocumentClass(event.data.className);
    documentClass.createDialog(
      {img: "icons/svg/aura.svg"},
      {parent: this.actor}
    );
  }

  get commanderMenu() {
    const commander = this.actor.system.commander;
    return [
      {
        name: game.i18n.localize("KNW.Warfare.Commander.View"),
        icon: "<i class='fas fa-eye'></i>",
        condition: commander,
        callback: () => commander.sheet.render(true)
      },
      {
        name: game.i18n.localize("KNW.Warfare.Commander.Clear"),
        icon: "<i class='fas fa-trash'></i>",
        condition: this.isEditable && commander,
        callback: this.clearCommander.bind(this)
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
