export default class WarfareSheet extends ActorSheet {
  /** @override */
  get template() {
    return 'modules/knw-actors/templates/warfare-sheet.hbs';
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dnd5e', 'sheet', 'actor', 'warfare'],
      width: 600,
      height: 360,
    });
  }

  /** @override */
  async getData(options) {
    const context = {
      ...super.getData(options),
      actor: this.actor,
      system: this.actor.system,
      coreStats: {
        atk: {
          label: game.i18n.localize('KNW.Warfare.Statistics.atk.abbr'),
          value: this.actor.system.atk.signedString(),
          rollable: this.isEditable ? 'rollable' : '',
        },
        def: {
          label: game.i18n.localize('KNW.Warfare.Statistics.def.abbr'),
          value: this.actor.system.def,
        },
        pow: {
          label: game.i18n.localize('KNW.Warfare.Statistics.pow.abbr'),
          value: this.actor.system.pow.signedString(),
          rollable: this.isEditable ? 'rollable' : '',
        },
        tou: {
          label: game.i18n.localize('KNW.Warfare.Statistics.tou.abbr'),
          value: this.actor.system.tou,
        },
        mor: {
          label: game.i18n.localize('KNW.Warfare.Statistics.mor.abbr'),
          value: this.actor.system.mor.signedString(),
          rollable: this.isEditable ? 'rollable' : '',
        },
        com: {
          label: game.i18n.localize('KNW.Warfare.Statistics.com.abbr'),
          value: this.actor.system.com.signedString(),
          rollable: this.isEditable ? 'rollable' : '',
        },
      },
      choices: CONFIG.KNW.CHOICES,
      traits: this.traits,
      typeImage: this.typeImage,
    };
    return context;
  }

  /**
   * @returns {string[] | null} An array of traits to display
   */
  get traits() {
    const traits = this.actor.system.traitList.split(';').map((e) => e.trim());
    return traits.length === 1 && !traits[0] ? null : traits;
  }

  /**
   * @returns {string} The image path
   */
  get typeImage() {
    const system = this.actor.system;
    if (system.type === 'infantry' && system.experience === 'levy')
      return 'modules/knw-actors/assets/icons/levy.png';
    else return CONFIG.KNW.CHOICES.TYPE[system.type].img;
  }

  async _onDropActor(event, data) {
    // Returns false if user does not have owners permissions of the organization
    if (!super._onDropActor(event, data)) return false;

    const dropActor = await fromUuid(data.uuid);
    if (dropActor.pack) {
      ui.notifications.warn('KNW.Warfare.Commander.Warning.Pack', {
        localize: true,
      });
      return false;
    } else if (
      !foundry.utils.getProperty(dropActor, 'system.attributes.prof')
    ) {
      ui.notifications.warn('KNW.Warfare.Commander.Warning.NoProf', {
        localize: true,
      });
      return false;
    }
    this.actor.update({ 'system.commander': dropActor.id });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on(
      'click',
      '.coreStat .label.rollable',
      {
        actor: this.actor,
      },
      this.#rollStat
    );
    html.on(
      'click',
      '.traits',
      {
        sheetID: this.id,
        actor: this.actor,
      },
      this._configureTraits
    );

    ContextMenu.create(this, html, '.commander .name', this.commanderMenu);
  }

  async #rollStat(event) {
    const stat = event.currentTarget.dataset.target;
    event.data.actor.system.rollStat(stat);
  }

  async _configureTraits(event) {
    const content = `<p>${game.i18n.localize(
      'KNW.Warfare.Traits.Instructions'
    )}</p>
    <input id="${event.data.sheetID}-traits" type="text" value="${
      event.data.actor.system.traitList
    }" placeholder="Adaptable; Stalwart">`;

    const update = await Dialog.wait({
      title: game.i18n.localize('KNW.Warfare.Traits.DialogTitle'),
      content,
      buttons: {
        save: {
          label: game.i18n.localize('SAVE'),
          icon: '<i class="fa-solid fa-floppy-disk"></i>',
          callback: (html) => {
            const input = html.find(`#${event.data.sheetID}-traits`)[0];
            return {
              'system.traitList': input.value,
            };
          },
        },
      },
    });

    event.data.actor.update(update);
  }

  get commanderMenu() {
    return [
      {
        name: game.i18n.localize('KNW.Warfare.Commander.View'),
        icon: "<i class='fas fa-eye'></i>",
        condition: true,
        callback: this.viewCommander,
      },
      {
        name: game.i18n.localize('KNW.Warfare.Commander.Clear'),
        icon: "<i class='fas fa-trash'></i>",
        condition: this.isEditable,
        callback: (html) => this.clearCommander(html, this.actor),
      },
    ];
  }

  async viewCommander(html) {
    const commanderID = html[0].dataset.id;
    const commander = game.actors.get(commanderID);
    commander.sheet.render(true);
  }

  async clearCommander(html, thisActor) {
    const commanderID = html[0].dataset.id;
    const commander = game.actors.get(commanderID);
    ui.notifications.info(
      game.i18n.format('KNW.Warfare.Commander.Warning.Remove', {
        commanderName: commander.name,
        warfareUnit: thisActor.name,
      })
    );
    thisActor.update({ 'system.commander': '' });
  }
}
