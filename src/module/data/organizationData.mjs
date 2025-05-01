/**
 * Tracks the development points spent during organization progress
 * @typedef {object} DevelopmentField
 * @param {number} points - Points spent on the parent trait
 * @param {number} start  - Starting value
 * @param {number} spec   - Bonuses from specialization
 */

/**
 * An Organization Skill
 * @typedef {object} Skill
 * @param {DevelopmentField} development  - The skill's development
 * @param {number} bonus                  - The derived bonus used during tests
 */

/**
 * An Organization Defense
 * @typedef {object} Defense
 * @param {DevelopmentField} development - The defense's development
 * @param {number} level                 - The level, as altered by Intrigue
 * @param {number} score                 - The derived score used to resist tests
 */

/**
 * Data Definition for Organization actors
 * @prop {object} org                 - Organization Info
 * @prop {string} org.type            - Organization Type
 * @prop {string} org.specialization  - Organization Specialization
 * @prop {object} skills              - The record of the organization's skills
 * @prop {Skill} skills.dip           - Diplomacy
 * @prop {Skill} skills.esp           - Espionage
 * @prop {Skill} skills.lor           - Lore
 * @prop {Skill} skills.opr           - Operations
 * @prop {object} defenses            - The record of the organization's defenses
 * @prop {Defense} defenses.com       - Communications
 * @prop {Defense} defenses.rlv       - Resolve
 * @prop {Defense} defenses.rsc       - Resources
 * @prop {number} size                - The organization's size
 * @prop {object} powerPool           - A mapping field that maps actor IDs to their current power die value
 * @prop {string} powers              - An HTML field for the domain powers
 * @prop {string} features            - An HTML field for the organization's features
 */
export default class OrganizationData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    const MappingField = game.dnd5e.dataModels.fields.MappingField;
    const data = {
      org: new fields.SchemaField({
        type: new fields.StringField({textSearch: true, label: "KNW.Organization.Type"}),
        specialization: new fields.StringField({textSearch: true, label: "KNW.Organization.Specialization"})
      }),
      skills: new fields.SchemaField({
        dip: new fields.SchemaField({
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          )
        }, {label: "KNW.Organization.skills.dip"}),
        esp: new fields.SchemaField({
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          )
        }, {label: "KNW.Organization.skills.esp"}),
        lor: new fields.SchemaField({
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          )
        }, {label: "KNW.Organization.skills.lor"}),
        opr: new fields.SchemaField({
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.skills
          )
        }, {label: "KNW.Organization.skills.opr"})
      }, {label: "KNW.Organization.skills.label"}),
      defenses: new fields.SchemaField({
        com: new fields.SchemaField({
          level: new fields.NumberField({
            required: true,
            initial: 0,
            choices: Array.from(CONFIG.KNW.CHOICES.com, (level) => level.value)
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defenses
          )
        }, {label: "KNW.Organization.defenses.com.Label"}),
        rlv: new fields.SchemaField({
          level: new fields.NumberField({
            required: true,
            initial: 0,
            choices: Array.from(CONFIG.KNW.CHOICES.rlv, (level) => level.value)
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defenses
          )
        }, {label: "KNW.Organization.defenses.rlv.Label"}),
        rsc: new fields.SchemaField({
          level: new fields.NumberField({
            required: true,
            initial: 0,
            choices: Array.from(CONFIG.KNW.CHOICES.rsc, (level) => level.value)
          }),
          development: this.#developmentField(
            CONFIG.KNW.ORGANIZATION.tracks.defenses
          )
        }, {label: "KNW.Organization.defenses.rsc.Label"})
      }),
      size: new fields.NumberField({
        required: true,
        initial: 1,
        choices: CONFIG.KNW.CHOICES.SIZE,
        label: "KNW.Organization.Size"
      }),
      powerPool: new MappingField(
        new fields.NumberField({
          required: true,
          nullable: true,
          initial: null,
          max: 12,
          min: 0
        }),
        {label: "KNW.Organization.Powers.Pool"}
      ),
      powers: new fields.HTMLField({textSearch: true, label: "KNW.Organization.Powers.Label"}),
      features: new fields.HTMLField({textSearch: true, label: "KNW.Organization.Features.Label"})
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
        integer: true
      }),
      start: new fields.NumberField({
        initial: track[0],
        nullable: false,
        min: track[0],
        max: track.slice(-1)
      }),
      spec: new fields.NumberField({initial: 0, integer: true})
    });
  }

  /**
   * Prepare data related to this DataModel itself, before any derived data is computed.
   * @inheritdoc
   */
  prepareBaseData() {
    for (const skill of Object.values(this.skills)) {
      skill.bonus = 0;
    }
    for (const def of Object.values(this.defenses)) {
      def.score = 0;
    }
  }

  /**
   * Apply transformations of derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   * @inheritdoc
   */
  prepareDerivedData() {
    for (const skill of Object.values(this.skills)) {
      skill.bonus +=
        CONFIG.KNW.ORGANIZATION.tracks.skills[skill.development.points];
    }
    for (const def of Object.values(this.defenses)) {
      def.score +=
        CONFIG.KNW.ORGANIZATION.tracks.defenses[def.development.points];
    }
  }

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
    const roll = Roll.create("1d@powerDie", {powerDie: this.powerDie});
    await roll.toMessage({
      speaker: {actor: actorID},
      flavor: game.i18n.localize("KNW.Organization.Powers.RollFlavor")
    });
    this.parent.update({[`system.powerPool.${actorID}`]: roll.total});
  }

  /**
   * Decrements the power die for the provided actor
   * @param {string} actorID  The ID of the organization member
   */
  async decrementPowerDie(actorID) {
    const currentValue = this.powerPool[actorID];
    this.parent.update({
      ["system.powerPool." + actorID]: Math.max(currentValue - 1, 0)
    });
  }

  /**
   * Rolls a given skill using an actor's proficiency bonus
   * @param {string} skill    The abbreviation of the skill being rolled
   * @param {Actor5e} actor   The actor making the skill test
   * @param {boolean} useProf Whether to use the actor's proficiency
   * @param {Event} [event]   Click event that triggered the roll
   */
  async rollSkillTest(skill, actor, useProf, event) {
    const isProf = CONFIG.KNW.ORGANIZATION.assocSkills[skill].some(
      (s) => actor.system.skills[s].proficient >= 1
    );
    const prof =
      isProf && useProf
        ? foundry.utils.getProperty(actor, "system.attributes.prof")
        : 0;
    if (prof === undefined)
      ui.notifications.warn("KNW.Organization.skills.Warning.Prof", {
        localize: true
      });
    const label = game.i18n.localize("KNW.Organization.skills." + skill);
    const testLabel = game.i18n.format("KNW.Organization.skills.Test.Title", {
      skill: label
    });
    return CONFIG.Dice.D20Roll.build({
      rolls: [{
        parts: ["@skill", "@prof"],
        data: {skill: this.skills[skill].bonus, prof},
        options: {}
      }],
      event,
      subject: actor
    }, {
      options: {
        window: {
          title: testLabel
        }
      }
    }, {
      data: {
        flavor: testLabel,
        speaker: {actor}
      }
    });
  }
}
