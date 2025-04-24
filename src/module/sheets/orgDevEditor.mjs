const {DocumentSheetV2, HandlebarsApplicationMixin} = foundry.applications.api;

export default class OrgDevEditor extends HandlebarsApplicationMixin(DocumentSheetV2) {
  /**
   * Render a pair of inputs for selecting a value in a range.
   * @param {object} options                Helper options
   * @param {string} [options.name]         The name of the field to create
   * @param {number} [options.value]        The current range value
   * @param {number} [options.displayValue] The displayed range value
   * @param {number} [options.min]          The minimum allowed value
   * @param {number} [options.max]          The maximum allowed value
   * @param {number} [options.step]         The allowed step size
   * @returns {Handlebars.SafeString}
   *
   * @example
   * ```hbs
   * {{rangePicker name="foo" value=bar min=0 max=10 step=1}}
   * ```
   */
  static rangePicker(options) {
    let {name, value, displayValue, min, max, step} = options.hash;
    name = name || "range";
    value = value ?? "";
    if (Number.isNaN(value)) value = "";
    const html = `<input type="range" name="${name}" value="${value}" min="${min}" max="${max}" step="${step}"/>
        <span class="range-value ${displayValue < 0 ? "invalid" : ""}">${displayValue ?? value}</span>`;
    return new Handlebars.SafeString(html);
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "KNW.Organization.Development.Configure"
    },
    position: {
      width: 360
    },
    sheetConfig: false,
    classes: ["organization", "orgDev"],
    form: {
      submitOnChange: true
    },
    statGroup: null
  };

  static PARTS = {
    body: {
      template: "modules/knw-actors/templates/org-development.hbs",
      root: true
    }
  };

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    let totalDevPoints = 0;
    const statGroup = this.options.statGroup;
    /** @type {number[]} */
    const track = CONFIG.KNW.ORGANIZATION.tracks[statGroup];
    const stats = Object.entries(this.document.system[statGroup]).map(
      ([key, stat]) => {
        const headstart = track.findIndex(
          (v) => v === stat.development.start + stat.development.spec
        );
        const displayValue = stat.development.points - headstart;
        totalDevPoints += displayValue;
        return {
          name: `system.${statGroup}.${key}.development`,
          label:
            statGroup === "skills"
              ? game.i18n.localize("KNW.Organization.skills." + key)
              : game.i18n.localize(`KNW.Organization.defenses.${key}.Label`),
          displayValue,
          ...stat
        };
      }
    );
    Object.assign(context, {
      statGroup: this.options.statGroup,
      stats,
      totalDevPoints,
      track,
      length: track.length - 1,
      min: track[0],
      max: track.slice(-1)[0]
    });
    return context;
  }
}
