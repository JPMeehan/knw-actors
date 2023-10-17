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
    )}-develop-${this.options.statGroup}`;
  }

  /** @inheritdoc */
  get title() {
    return game.i18n.localize("KNW.Organization.Development.Configure");
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["organization", "orgDev"],
      closeOnSubmit: false,
      submitOnChange: true,
      width: 360,
    });
  }

  /** @inheritdoc */
  async getData(options) {
    const statGroup = this.options.statGroup;
    const track = CONFIG.KNW.ORGANIZATION.tracks[statGroup];
    const context = {
      title: game.i18n.localize("KNW.Organization.Development.Configure"),
      ...super.getData(options),
      stats: Object.entries(this.document.system[statGroup]).map(
        ([key, stat]) => {
          return {
            name: `system.${statGroup}.${key}.development`,
            label:
              statGroup === "skills"
                ? game.i18n.localize("KNW.Organization.skills." + key)
                : game.i18n.localize(
                    "KNW.Organization.defenses." + key + ".Label"
                  ),
            ...stat,
          };
        }
      ),
      track,
      length: CONFIG.KNW.ORGANIZATION.tracks[statGroup].length - 1,
      min: track[0],
      max: track.slice(-1)[0],
    };
    return context;
  }

  /** @inheritdoc */
  async _updateObject(event, formData) {
    console.log(formData);
    console.log(this.object);
    if (!this.object.id) return;
    return this.object.update(formData);
  }
}
