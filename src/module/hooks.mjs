/** @import {ApplicationRenderContext, ApplicationRenderOptions} from "@client/applications/_types.mjs" */
/** @import {TokenConfig} from "@client/applications/sheets/_module.mjs"; */

/**
 * Adjust the available stats to use for warfare tokens
 * @param {TokenConfig} application            The Application instance being rendered
 * @param {HTMLElement} html                   The inner HTML of the document that will be displayed and may be modified
 * @param {ApplicationRenderContext} context   The application rendering context data
 * @param {ApplicationRenderOptions} options   The application rendering options
 */
export function warfareTokenBar(application, html, context, options) {
  const barSelects = html.querySelectorAll("select[name=\"bar1.attribute\"], select[name=\"bar2.attribute\"]");
  for (const bar of barSelects) {
    let skipFirst = true;
    for (const el of bar.querySelectorAll("option")) {
      if (skipFirst) {
        skipFirst = false;
        continue;
      }
      el.remove();
    }
    for (const grp of bar.querySelectorAll("optgroup")) {
      switch (grp.label) {
        case game.i18n.localize("TOKEN.BarAttributes"):
          grp.innerHTML = `<option value="size">${game.i18n.localize(
            "KNW.Warfare.Statistics.size.long"
          )}</option>`;
          break;
        case game.i18n.localize("TOKEN.BarValues"):
          grp.innerHTML = ["attacks", "def", "tou"]
            .map(
              (abbr) =>
                `<option value="${abbr}">${game.i18n.localize(
                  `KNW.Warfare.Statistics.${abbr}.long`
                )}</option>`
            )
            .join("")
            .concat(
              `<option value="tier">${game.i18n.localize(
                "KNW.Warfare.Tier"
              )}</option>`
            );
          break;
        case game.i18n.localize("DND5E.MovementSpeeds"):
          grp.innerHTML = `<option value="mov">${game.i18n.localize(
            "KNW.Warfare.Statistics.mov.long"
          )}</option>`;
          break;
        default:
          grp.remove();
      }
    }
  }

}
