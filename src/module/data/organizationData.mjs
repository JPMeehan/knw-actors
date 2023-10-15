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
      skills: new fields.SchemaField({
        dip: new fields.SchemaField({
          // value: new fields.NumberField({
          //   required: true,
          //   initial: -1,
          //   nullable: false,
          //   integer: true,
          // }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skill
          ),
        }),
        esp: new fields.SchemaField({
          // value: new fields.NumberField({
          //   required: true,
          //   initial: -1,
          //   nullable: false,
          //   integer: true,
          // }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skill
          ),
        }),
        lor: new fields.SchemaField({
          // value: new fields.NumberField({
          //   required: true,
          //   initial: -1,
          //   nullable: false,
          //   integer: true,
          // }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skill
          ),
        }),
        opr: new fields.SchemaField({
          // value: new fields.NumberField({
          //   required: true,
          //   initial: -1,
          //   nullable: false,
          //   integer: true,
          // }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skill
          ),
        }),
      }),
      defenses: new fields.SchemaField({
        com: new fields.SchemaField({
          // score: new fields.NumberField({
          //   required: true,
          //   initial: 10,
          //   nullable: false,
          //   integer: true,
          // }),
          level: new fields.NumberField({
            required: true,
            initial: 0,
            choices: Array.from(CONFIG.KNW.CHOICES.com, (level) => level.value),
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defense
          ),
        }),
        rlv: new fields.SchemaField({
          // score: new fields.NumberField({
          //   required: true,
          //   initial: 10,
          //   nullable: false,
          //   integer: true,
          // }),
          level: new fields.NumberField({
            required: true,
            initial: 0,
            choices: Array.from(CONFIG.KNW.CHOICES.rlv, (level) => level.value),
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defense
          ),
        }),
        rsc: new fields.SchemaField({
          // score: new fields.NumberField({
          //   required: true,
          //   initial: 10,
          //   nullable: false,
          //   integer: true,
          // }),
          level: new fields.NumberField({
            required: true,
            initial: 0,
            choices: Array.from(CONFIG.KNW.CHOICES.rsc, (level) => level.value),
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defense
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
          required: true,
          nullable: true,
          initial: null,
          max: 12,
          min: 0,
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
   * Creates the data necessary for the various stats
   * @param {array} track The track for this field
   */
  static #developmentField(track) {
    return new fields.SchemaField({
      points: new fields.NumberField({
        initial: 0,
        nullable: false,
        min: 0,
        max: track.length,
        integer: true,
      }),
      start: new fields.NumberField({
        initial: track[0],
        nullable: false,
        min: track[0],
        max: track.slice(-1),
      }),
      spec: new fields.NumberField({ initial: 0, integer: true }),
    });
  }

  /**
   * Prepare data related to this DataModel itself, before any derived data is computed.
   */
  prepareBaseData() {
    for (const skill of this.skills) {
      skill.value = 0;
    }
    for (const def of this.defenses) {
      def.score = 0;
    }
  }

  /**
   * Apply transformations of derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   */
  prepareDerivedData() {
    for (const skill of this.skills) {
      skill.value +=
        CONFIG.KNW.ORGANIZATION.tracks.skill[skill.development.points];
    }
    for (const def of this.defenses) {
      def.score +=
        CONFIG.KNW.ORGANIZATION.tracks.defense[def.development.points] +
        def.level;
    }
  }

  /**
   * @returns {number} The number of sides on the power die
   */
  get powerDie() {
    return CONFIG.KNW.CHOICES.SIZE[this.size].powerDie;
  }

  /**
   * @returns The sorted object of powers
   */
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
   * Decrements the power die for the provided actor
   * @param {string} actorID  The ID of the organization member
   */
  async decrementPowerDie(actorID) {
    const currentValue = this.powerPool[actorID];
    this.parent.update({
      ["system.powerPool." + actorID]: Math.max(currentValue - 1, 0),
    });
  }

  /**
   * Rolls a given skill using an actor's proficiency bonus
   * @param {string} skill    The abbreviation of the skill being rolled
   * @param {Actor5e} actor   The actor making the skill test
   */
  async rollSkillTest(skill, actor) {
    const isProf = CONFIG.KNW.ORGANIZATION.assocSkills[skill].reduce(
      (accumulator, currentValue) => {
        return actor.system.skills[currentValue].proficient >= 1 || accumulator;
      },
      false
    );
    const prof = isProf
      ? foundry.utils.getProperty(actor, "system.attributes.prof")
      : 0;
    if (prof === undefined)
      ui.notifications.warn("KNW.Organization.Skills.Warning.Prof", {
        localize: true,
      });
    const label = game.i18n.localize("KNW.Organization.Skills." + skill);
    const roll = game.dnd5e.dice.d20Roll({
      parts: ["@skill", "@prof"],
      data: { skill: this.skills[skill], prof },
      title: game.i18n.format("KNW.Organization.Skills.Test.Title", {
        skill: label,
      }),
      messageData: {
        speaker: {
          actor,
        },
      },
    });
    console.log(await roll);
  }
}
