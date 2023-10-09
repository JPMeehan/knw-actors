/**
 * Data Definition for Warfare actors
 */
export default class WarfareData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields
    const data = {
      commander: new fields.StringField({
        textSearch: true,
      }),
      ancestry: new fields.StringField({
        textSearch: true,
      }),
      experience: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.EXPERIENCE,
        initial: "regular",
        textSearch: true,
      }),
      gear: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.GEAR,
        initial: "light",
        textSearch: true,
      }),
      type: new fields.StringField({
        choices: CONFIG.KNW.CHOICES.TYPE,
        initial: "infantry",
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
        initial: "",
        nullable: false,
        textSearch: true,
      }),
    }

    return data
  }

  /**
   * @returns {number} Current units remaining for a battle
   */
  get casualtyDie() {
    return this.size.value
  }
}
