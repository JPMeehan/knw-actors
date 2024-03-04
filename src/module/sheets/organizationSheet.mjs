import OrgDevEditor from './orgDevEditor.mjs';

export default class OrganizationSheet extends ActorSheet {
  /** @override */
  get template() {
    return 'modules/knw-actors/templates/organization-sheet.hbs';
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dnd5e', 'sheet', 'actor', 'organization'],
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
          label: game.i18n.localize('KNW.Organization.skills.' + key),
          bonus: skill.bonus,
        };
      }),
      defenses: Object.entries(this.actor.system.defenses).map(([key, def]) => {
        return {
          key,
          label: game.i18n.localize(
            'KNW.Organization.defenses.' + key + '.Label'
          ),
          level: def.level,
          score: def.score,
          choices: CONFIG.KNW.CHOICES[key],
        };
      }),
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
      let tooltip = 'KNW.Organization.Powers.Take';
      let decrement = `<a class="subtract"><i class="fas fa-minus"></i></a>`;
      if (value === null) {
        value = '<i class="fa-solid fa-dice-d20"></i>';
        tooltip = 'KNW.Organization.Powers.Roll';
        decrement = '';
      } else if (value === 0) {
        value = '<i class="fa-solid fa-repeat"></i>';
        tooltip = 'KNW.Organization.Powers.Rest';
        decrement = '';
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
    /**
     * Checks if user does not have
     * owner permission of the organization
     */
    if (super._onDropActor(event, data) === false) return false;

    const dropActor = await fromUuid(data.uuid);
    if (dropActor.pack) {
      ui.notifications.warn('KNW.Organization.Powers.Warning.NoPackActors', {
        localize: true,
      });
      return false;
    } else if (
      !foundry.utils.getProperty(dropActor, 'system.attributes.prof')
    ) {
      ui.notifications.warn('KNW.Organization.Powers.Warning.NoProf', {
        localize: true,
      });
      return false;
    } else if (this.actor.system.powerPool.hasOwnProperty(dropActor.id)) {
      ui.notifications.warn('KNW.Organization.Powers.Warning.AlreadyMember', {
        localize: true,
      });
      return false;
    }
    this.actor.update({ [`system.powerPool.${dropActor.id}`]: null });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on('click', '.body .editScore>a', this.#editScore.bind(this));

    html.on('click', '.skills .label.rollable', this.#rollSkill.bind(this));
    html.on('click', '.powerDie.rollable', this.#cyclePowerDie.bind(this));
    html.on(
      'click',
      '.powerPoolList .edit .subtract',
      this.#decrementPowerDie.bind(this)
    );

    ContextMenu.create(this, html, '.powerPoolMember', this.powerPoolItemMenu);
  }

  async #editScore(event) {
    const statGroup = event.currentTarget.dataset.target;
    const context = {
      statGroup,
    };
    const orgDevEditor = new OrgDevEditor(this.actor, context);
    orgDevEditor.render(true);
  }

  async #rollSkill(event) {
    const stat = event.currentTarget.dataset.target;
    const validActors = Object.keys(this.actor.system.powerPool)
      .map((memberID) => game.actors.get(memberID))
      .filter((member) => member.isOwner);

    const assocSkillsText = CONFIG.KNW.ORGANIZATION.assocSkills[stat].reduce(
      (accumulator, currentValue, currentIndex, array) => {
        return (
          accumulator +
          ' ' +
          CONFIG.DND5E.skills[currentValue].label +
          (currentIndex === array.length - 1 ? '' : ',')
        );
      },
      game.i18n.localize('KNW.Organization.skills.Test.AssocSkills')
    );

    if (validActors.length === 0)
      ui.notifications.warn('KNW.Organization.skills.Warning.noActors', {
        localize: true,
      });
    else if (validActors.length === 1) {
      const useProf = await Dialog.wait({
        title: game.i18n.format('KNW.Organization.skills.Test.Title', {
          skill: game.i18n.localize('KNW.Organization.skills.' + stat),
        }),
        content: `<label class="flexrow"><p class="orgUseProf">${game.i18n.localize(
          'KNW.Organization.skills.Test.UseProf'
        )}</p>
        <input class="orgTestUseProf" type="checkbox" /></label>
        <p><em>${assocSkillsText}</em></p>`,
        buttons: {
          default: {
            icon: '<i class="fa-solid fa-floppy-disk"></i>',
            label: game.i18n.localize('KNW.Organization.skills.Test.Roll'),
            callback: (html) => {
              return html.find('.orgTestUseProf')[0].checked;
            },
          },
        },
      });
      this.actor.system.rollSkillTest(stat, validActors[0], useProf, event);
    } else {
      const selectOptions = validActors.map((actor) => ({
        memberID: actor.id,
        memberName: actor.name,
      }));

      const testInput = await Dialog.wait({
        title: game.i18n.format('KNW.Organization.skills.Test.Title', {
          skill: game.i18n.localize('KNW.Organization.skills.' + stat),
        }),
        content: `<label class="orgChooseActorLabel">${game.i18n.localize(
          'KNW.Organization.skills.Test.ChooseActor'
        )}
        <select class='orgChooseActor'>
        ${Handlebars.helpers.selectOptions(selectOptions, {
          hash: { nameAttr: 'memberID', labelAttr: 'memberName' },
        })}
        </select></label>
        <label class="flexrow"><p class="orgUseProf">${game.i18n.localize(
          'KNW.Organization.skills.Test.UseProf'
        )}</p>
        <input class="orgTestUseProf" type="checkbox" /></label>
        <p><em>${assocSkillsText}</em></p>`,
        buttons: {
          default: {
            icon: '<i class="fa-solid fa-floppy-disk"></i>',
            label: game.i18n.localize('KNW.Organization.skills.Test.Roll'),
            callback: (html) => {
              return {
                chosenActor: game.actors.get(
                  html.find('.orgChooseActor')[0].value
                ),
                useProf: html.find('.orgTestUseProf')[0].checked,
              };
            },
          },
        },
      });
      if (testInput?.chosenActor)
        this.actor.system.rollSkillTest(
          stat,
          testInput.chosenActor,
          testInput.useProf,
          event
        );
    }
  }

  async #cyclePowerDie(event) {
    const memberID = event.currentTarget.closest('li').dataset.id;
    const currentValue = this.actor.system.powerPool[memberID];
    const memberActor = game.actors.get(memberID);
    switch (currentValue) {
      case null: // Available
        if (memberActor.isOwner) this.actor.system.rollPowerDie(memberID);
        else
          ui.notifications.warn('KNW.Organization.Powers.Warning.MustOwnRoll', {
            localize: true,
          });
        break;
      case 0: // Take Extended Rest
        if (memberActor.isOwner)
          this.actor.update({ [`system.powerPool.${memberID}`]: null });
        else
          ui.notifications.warn('KNW.Organization.Powers.Warning.MustOwnRest', {
            localize: true,
          });
        break;
      default:
        ChatMessage.create({
          user: game.user,
          content: game.i18n.format('KNW.Organization.Powers.TakeValue', {
            currentValue,
            orgName: this.actor.name,
          }),
        });
        this.actor.update({ [`system.powerPool.${memberID}`]: 0 });
    }
  }

  async #decrementPowerDie(event) {
    this.actor.system.decrementPowerDie(
      event.currentTarget.closest('li').dataset.id
    );
  }

  get powerPoolItemMenu() {
    return [
      {
        name: game.i18n.localize(
          'KNW.Organization.Powers.ContextMenu.SetValue'
        ),
        icon: "<i class='fas fa-edit'></i>",
        condition: this.isEditable,
        callback: this.setDieValue.bind(this),
      },
      {
        name: game.i18n.localize(
          'KNW.Organization.Powers.ContextMenu.ViewMember'
        ),
        icon: "<i class='fas fa-eye'></i>",
        condition: true,
        callback: this.viewMember.bind(this),
      },
      {
        name: game.i18n.localize(
          'KNW.Organization.Powers.ContextMenu.RemoveMember'
        ),
        icon: "<i class='fas fa-trash'></i>",
        condition: this.isEditable,
        callback: this.deleteMember.bind(this),
      },
    ];
  }

  async setDieValue(html) {
    const memberID = html[0].dataset.id;

    new Dialog({
      title: game.i18n.localize('KNW.Organization.Powers.SetValue'),
      content: Handlebars.helpers.numberInput(
        this.actor.system.powerPool[memberID],
        { hash: { class: 'powerDie', min: 0, max: this.actor.system.powerDie } }
      ).string,
      buttons: {
        default: {
          icon: '<i class="fa-solid fa-floppy-disk"></i>',
          label: game.i18n.localize('Save Changes'),
          callback: (dialogHTML) => {
            const newValue = dialogHTML.find('.powerDie')[0].value
              ? dialogHTML.find('.powerDie')[0].value
              : null;
            this.actor.update({
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

  async deleteMember(html) {
    const memberID = html[0].dataset.id;
    const member = game.actors.get(memberID);
    ui.notifications.info(
      game.i18n.format('KNW.Organization.Powers.Warning.RemoveMember', {
        memberName: member?.name,
        organization: this.actor.name,
      })
    );
    this.actor.update({ [`system.powerPool.-=${memberID}`]: null });
  }
}
