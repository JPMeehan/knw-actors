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
      commander: new fields.StringField({
        textSearch: true,
      }),
      ancestry: new fields.StringField({
        textSearch: true,
      }),
      experience: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.EXPERIENCE,
        initial: 'regular',
        textSearch: true,
      }),
      gear: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.GEAR,
        initial: 'light',
        textSearch: true,
      }),
      type: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.TYPE,
        initial: 'infantry',
        textSearch: true,
      }),
      atk: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
      }),
      def: new fields.NumberField({
        required: true,
        initial: 10,
        nullable: false,
        integer: true,
      }),
      pow: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
      }),
      tou: new fields.NumberField({
        required: true,
        initial: 10,
        nullable: false,
        integer: true,
      }),
      mor: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
      }),
      com: new fields.NumberField({
        required: true,
        initial: 0,
        nullable: false,
        integer: true,
      }),
      attacks: new fields.NumberField({
        required: true,
        initial: 1,
        nullable: false,
        integer: true,
      }),
      dmg: new fields.NumberField({
        required: true,
        initial: 1,
        nullable: false,
        integer: true,
      }),
      mov: new fields.NumberField({
        required: true,
        initial: 1,
        nullable: false,
        integer: true,
      }),
      tier: new fields.NumberField({
        required: true,
        initial: 1,
        choices: CONFIG.KNW.CHOICES.TIER,
        integer: true,
      }),
      size: new fields.SchemaField({
        max: new fields.NumberField({
          required: true,
          initial: 6,
          integer: true,
        }),
        value: new fields.NumberField({
          required: true,
          initial: 6,
          integer: true,
        }),
      }),
      traitList: new fields.StringField({
        initial: '',
        nullable: false,
        textSearch: true,
      }),
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
    const commander = game.actors.get(this.commander);
    if (commander) return commander.name;
    else return game.i18n.localize('KNW.Warfare.Commander.None');
  }

  /**
   *
   * @param {string} stat     Warfare stat to roll
   * @param {Event} [event]   Optional event
   */
  async rollStat(stat, event) {
    const roll = game.dnd5e.dice.d20Roll({
      parts: ['@stat'],
      data: {
        stat: this[stat],
      },
      title: game.i18n.format('KNW.Warfare.Statistics.Test', {
        stat: game.i18n.localize(`KNW.Warfare.Statistics.${stat}.long`),
        actorName: this.parent.name,
      }),
      flavor: game.i18n.format('KNW.Warfare.Statistics.Test', {
        stat: game.i18n.localize(`KNW.Warfare.Statistics.${stat}.long`),
        actorName: game.actors.get(this.commander)?.name ?? '',
      }),
      messageData: {
        speaker: { actor: this.parent },
      },
      event,
    });
  }
}
