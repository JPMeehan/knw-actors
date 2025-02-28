/**
 * Data Definition for Warfare actors
 * @prop {string} commander
 * @prop {string} ancestry
 * @prop {string} experience
 * @prop {string} gear
 * @prop {string} type
 * @prop {number} atk
 * @prop {number} def
 * @prop {number} pow
 * @prop {number} tou
 * @prop {number} mor
 * @prop {number} com
 * @prop {number} attacks
 * @prop {number} dmg
 * @prop {number} mov
 * @prop {number} tier
 * @prop {object} size
 * @prop {number} size.value
 * @prop {number} size.max
 * @prop {string} traitList
 */
export default class WarfareData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const data = {
      commander: new fields.ForeignDocumentField(getDocumentClass("Actor"), {
        textSearch: true, label: "KNW.Warfare.Commander.Label"
      }),
      ancestry: new fields.StringField({
        textSearch: true, label: "KNW.Warfare.Ancestry"
      }),
      experience: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.EXPERIENCE,
        initial: "regular",
        textSearch: true,
        label: "KNW.Warfare.Experience.Label"
      }),
      gear: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.GEAR,
        initial: "light",
        textSearch: true,
        label: "KNW.Warfare.Gear.Label"
      }),
      type: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.TYPE,
        initial: "infantry",
        textSearch: true,
        label: "KNW.Warfare.Type.Label"
      }),
      atk: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.atk.long"
      }),
      def: new fields.NumberField({
        required: true,
        initial: 10,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.def.long"
      }),
      pow: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.pow.long"
      }),
      tou: new fields.NumberField({
        required: true,
        initial: 10,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.tou.long"
      }),
      mor: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.mor.long"
      }),
      com: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.com.long"
      }),
      attacks: new fields.NumberField({
        required: true,
        initial: 1,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.attacks.long"
      }),
      dmg: new fields.NumberField({
        required: true,
        initial: 1,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.dmg.long"
      }),
      mov: new fields.NumberField({
        required: true,
        initial: 1,
        nullable: false,
        integer: true,
        label: "KNW.Warfare.Statistics.move.long"
      }),
      tier: new fields.NumberField({
        required: true,
        initial: 1,
        choices: CONFIG.KNW.CHOICES.TIER,
        integer: true,
        label: "KNW.Warfare.Tier"
      }),
      size: new fields.SchemaField({
        max: new fields.NumberField({
          required: true,
          initial: 6,
          integer: true
        }),
        value: new fields.NumberField({
          required: true,
          initial: 6,
          integer: true
        })
      }, {label: "KNW.Warfare.Statistics.size.long"}),
      traitList: new fields.StringField({
        initial: "",
        nullable: false,
        textSearch: true,
        label: "KNW.Warfare.Traits.SheetLabel"
      })
    };

    return data;
  }

  /**
   * @returns {number} Current units remaining for a battle
   */
  get casualtyDie() {
    return this.size.value;
  }

  get commanderName() {
    const commander = this.commander;
    if (commander) return commander.name;
    else return game.i18n.localize("KNW.Warfare.Commander.None");
  }

  /**
   * Rolls one of the Warfare unit's stats
   * @param {string} stat     Warfare stat to roll
   * @param {Event} [event]   Optional event
   */
  async rollStat(stat, event) {
    return CONFIG.Dice.D20Roll.build({
      rolls: [{
        parts: ["@stat"],
        data: {
          stat: this[stat]
        },
        options: {}
      }],
      event
    }, {
      options: {
        window: {
          title: game.i18n.format("KNW.Warfare.Statistics.Test", {
            stat: game.i18n.localize(`KNW.Warfare.Statistics.${stat}.long`),
            actorName: this.parent.name
          })
        }
      }
    },
    {
      data: {
        speaker: {actor: this.parent},
        flavor: game.i18n.format("KNW.Warfare.Statistics.Test", {
          stat: game.i18n.localize(`KNW.Warfare.Statistics.${stat}.long`),
          actorName: this.commander?.name ?? ""
        })
      }
    });
  }
}
