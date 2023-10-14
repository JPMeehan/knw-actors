/**
 * Data Definition for Organization actors
 * @prop {object} org   -       Organization Info
 * @prop {string} org.type   -  Organization Type
 * @prop {string} org.specialization    -   Organization Specialization
 * @prop {number} dip   -       Diplomacy
 * @prop {number} esp   -       Espionage
 * @prop {number} lor   -       Lore
 * @prop {number} opr   -       Operations
 * @prop {number} com   -       Communications
 * @prop {number} rlv   -       Resolve
 * @prop {number} rsc   -       Resources
 * @prop {object} power -       The power pool
 * @prop {number} power.die  -  The size of the organization's power die
 * @prop {number} power.pool -  The number of power dice available to the organization
 * @prop {object} powers     -  A mapping field of the domain powers
 * @prop {object} features   -  A mapping field of the organization's features
 */
export default class OrganizationData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const MappingField = game.dnd5e.dataModels.fields.MappingField;
    const data = {
      org: new fields.SchemaField({
        type: new fields.StringField({ textSearch: true }),
        specialization: new fields.StringField({ textSearch: true }),
      }),
      dip: new fields.NumberField({
        required: true,
        initial: -1,
        nullable: false,
        integer: true,
      }),
      esp: new fields.NumberField({
        required: true,
        initial: -1,
        nullable: false,
        integer: true,
      }),
      lor: new fields.NumberField({
        required: true,
        initial: -1,
        nullable: false,
        integer: true,
      }),
      opr: new fields.NumberField({
        required: true,
        initial: -1,
        nullable: false,
        integer: true,
      }),
      com: new fields.SchemaField({
        score: new fields.NumberField({
          required: true,
          initial: 10,
          nullable: false,
          integer: true,
        }),
        level: new fields.NumberField({
          required: true,
          initial: 0,
          choices: Array.from(
            CONFIG.KNW.CHOICES.COMMUNICATIONS,
            (level) => level.value
          ),
        }),
      }),
      rlv: new fields.SchemaField({
        score: new fields.NumberField({
          required: true,
          initial: 10,
          nullable: false,
          integer: true,
        }),
        level: new fields.NumberField({
          required: true,
          initial: 0,
          choices: Array.from(
            CONFIG.KNW.CHOICES.RESOLVE,
            (level) => level.value
          ),
        }),
      }),
      rsc: new fields.SchemaField({
        score: new fields.NumberField({
          required: true,
          initial: 10,
          nullable: false,
          integer: true,
        }),
        level: new fields.NumberField({
          required: true,
          initial: 0,
          choices: Array.from(
            CONFIG.KNW.CHOICES.RESOURCES,
            (level) => level.value
          ),
        }),
      }),
      size: new fields.NumberField({
        required: true,
        initial: 1,
        choices: CONFIG.KNW.CHOICES.SIZE,
      }),
      powerPool: new MappingField(
        new fields.NumberField({
          required: false,
          nullable: true,
          initial: undefined,
          max: 12,
          min: 1,
        }),
        {}
      ),
      powers: new MappingField(
        new fields.SchemaField({
          label: new fields.StringField({
            textSearch: true,
          }),
          description: new fields.StringField({}),
          sort: new fields.IntegerSortField({}),
        }),
        {}
      ),
      features: new MappingField(
        new fields.SchemaField({
          label: new fields.StringField({
            textSearch: true,
          }),
          description: new fields.StringField({}),
          sort: new fields.IntegerSortField({}),
        }),
        {}
      ),
    };

    return data;
  }

  /**
   * @returns {number} The number of sides on the power die
   */
  get powerDie() {
    return CONFIG.KNW.CHOICES.SIZE[this.size].powerDie;
  }

  get sortedPowers() {
    return this.#sortMap(this.powers);
  }

  get sortedFeatures() {
    return this.#sortMap(this.features);
  }

  /**
   * Sorts a mapping field by its sort value
   * @param {Map} target  The field to sort
   * @returns {Array}     The sorted results
   */
  #sortMap(target) {
    const entries = Object.entries(target);

    entries.sort((a, b) => {
      return a.sort - b.sort;
    });

    const sorted = Array.from(entries, ([mapID, entry]) => ({
      mapID,
      ...entry,
    }));

    return sorted;
  }

  /**
   * Rolls and sets the given actor's power die in the pool
   * @param {string} actorID The ID of the actor rolling their power die
   */
  async rollPowerDie(actorID) {
    const roll = new Roll("1d@powerDie", { powerDie: this.powerDie });
    await roll.toMessage({
      speaker: { actor: actorID },
      flavor: game.i18n.localize("KNW.Organization.Powers.RollFlavor"),
    });
    this.parent.update({ [`system.powerPool.${actorID}`]: roll.total });
  }

  /**
   * Updates the power die for the provided actor
   * @param {string} actorID  The ID of the actor who's power die is being updated
   * @param {string} mode     Add, subtract, or delete
   */
  async editPowerDie(actorID, mode) {
    const currentValue = this.powerPool[actorID];
    switch (mode) {
      case "add":
        this.parent.update({
          ["system.powerPool." + actorID]: Math.min(
            currentValue + 1,
            this.powerDie
          ),
        });
        break;
      case "subtract":
        const newValue = Math.max(currentValue - 1, 0);
        this.parent.update({
          ["system.powerPool." + actorID]: newValue ? newValue : null,
        });
        break;
      case "delete":
        this.parent.update({
          ["system.powerPool." + actorID]: null,
        });
    }
  }

  /**
   * Rolls a given skill using an actor's proficiency bonus
   * @param {string} skill    The abbreviation of the skill being rolled
   * @param {Actor5e} actor   The actor making the skill test
   */
  async rollSkillTest(skill, actor) {
    const prof = foundry.utils.getProperty(actor, "system.attributes.prof");
    if (!prof)
      ui.notifications.warn(
        game.i18n.localize("KNW.Organization.Skills.Warning.Prof")
      );
    console.log(skill);
    const label = game.i18n.localize("KNW.Organization.Skills." + skill);
    const roll = game.dnd5e.dice.d20Roll({
      parts: ["@skill", "@prof"],
      data: { skill: this[skill], prof },
      title: game.i18n.format("KNW.Organization.Skills.Test", { skill: label }),
    });
    console.log(await roll);
  }
}
