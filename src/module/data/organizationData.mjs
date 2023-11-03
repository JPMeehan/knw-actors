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
          bonus: new fields.NumberField({
            required: true,
            initial: -1,
            nullable: false,
            integer: true,
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          ),
        }),
        esp: new fields.SchemaField({
          bonus: new fields.NumberField({
            required: true,
            initial: -1,
            nullable: false,
            integer: true,
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          ),
        }),
        lor: new fields.SchemaField({
          bonus: new fields.NumberField({
            required: true,
            initial: -1,
            nullable: false,
            integer: true,
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          ),
        }),
        opr: new fields.SchemaField({
          bonus: new fields.NumberField({
            required: true,
            initial: -1,
            nullable: false,
            integer: true,
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          ),
        }),
      }),
      defenses: new fields.SchemaField({
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
            choices: Array.from(CONFIG.KNW.CHOICES.com, (level) => level.value),
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defenses
          ),
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
            choices: Array.from(CONFIG.KNW.CHOICES.rlv, (level) => level.value),
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defenses
          ),
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
            choices: Array.from(CONFIG.KNW.CHOICES.rsc, (level) => level.value),
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defenses
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
      powers: new fields.HTMLField({ textSearch: true }),
      features: new fields.HTMLField({ textSearch: true }),
    };

    return data;
  }

  /**
   * Creates the data necessary for the various stats
   * @param {array} track The track for this field
   */
  static #developmentField(track) {
    const fields = foundry.data.fields;
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

  // /**
  //  * Prepare data related to this DataModel itself, before any derived data is computed.
  //  * @override
  //  */
  // prepareBaseData() {
  //   for (const skill of this.skills) {
  //     skill.bonus = 0;
  //     console.log(skill);
  //   }
  //   for (const def of this.defenses) {
  //     def.score = 0;
  //     console.log(def);
  //   }
  // }

  // /**
  //  * Apply transformations of derivations to the values of the source data object.
  //  * Compute data fields whose values are not stored to the database.
  //  * @override
  //  */
  // prepareDerivedData() {
  //   for (const skill of this.skills) {
  //     skill.bonus +=
  //       CONFIG.KNW.ORGANIZATION.tracks.skill[skill.development.points];
  //   }
  //   for (const def of this.defenses) {
  //     def.score +=
  //       CONFIG.KNW.ORGANIZATION.tracks.defense[def.development.points] +
  //       def.level;
  //   }
  // }

  /**
   * @returns {number} The number of sides on the power die
   */
  get powerDie() {
    return CONFIG.KNW.CHOICES.SIZE[this.size].powerDie;
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
   * @param {boolean} useProf Whether to use the actor's proficiency
   */
  async rollSkillTest(skill, actor, useProf) {
    const isProf = CONFIG.KNW.ORGANIZATION.assocSkills[skill].reduce(
      (accumulator, currentValue) => {
        return actor.system.skills[currentValue].proficient >= 1 || accumulator;
      },
      false
    );
    const prof =
      isProf && useProf
        ? foundry.utils.getProperty(actor, "system.attributes.prof")
        : 0;
    if (prof === undefined)
      ui.notifications.warn("KNW.Organization.skills.Warning.Prof", {
        localize: true,
      });
    const label = game.i18n.localize("KNW.Organization.skills." + skill);
    return game.dnd5e.dice.d20Roll({
      parts: ["@skill", "@prof"],
      data: { skill: this.skills[skill].bonus, prof },
      title: game.i18n.format("KNW.Organization.skills.Test.Title", {
        skill: label,
      }),
      messageData: {
        speaker: { actor },
      },
    });
  }
}
