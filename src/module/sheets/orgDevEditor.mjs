export default class OrgDevEditor extends FormApplication {
  /** @inheritdoc */
  get template() {
    return "modules/knw-actors/templates/org-development.hbs";
  }

  /** @inheritdoc */
  get document() {
    return this.object;
  }

  /** @inheritdoc */
  get id() {
    return `${this.constructor.name}-${this.document.uuid.replace(
      /\./g,
      "-"
    )}-edit-${this.options.statGroup}`;
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      closeOnSubmit: false,
      submitOnChange: true,
    });
  }

  /** @inheritdoc */
  async getData(options) {
    const context = super.getData(options);
    if (this.options.stats && this.options.max) {
      context.stats = this.options.stats;
      context.max = this.options.max;
    } else console.warn("Couldn't find Stats or Options", this.options);
    return context;
  }

  /** @inheritdoc */
  async _updateObject(event, formData) {
    if (!this.object.id) return;
    return this.object.update(formData);
  }
}
