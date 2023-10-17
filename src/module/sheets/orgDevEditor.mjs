export default class OrgDevEditor extends FormApplication {
  get template() {
    return "modules/knw-actors/templates/org-development.hbs";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      closeOnSubmit: false,
      submitOnChange: true,
    });
  }

  async getData(options) {
    const context = super.getData(options);
    if (this.options.stats && this.options.max) {
      context.stats = this.options.stats;
      context.max = this.options.max;
    } else console.warn("Couldn't find Stats or Options", this.options);
    return context;
  }
}
