/**
 *
 * @param {TokenConfig} app
 * @param {JQuery} html
 * @param {object} context
 */
export function warfareTokenBar(app, html, context) {
  const barSelects = html.find('.bar-attribute');
  barSelects.find('option:gt(0)').remove();
  for (const grp of barSelects.find('optgroup')) {
    switch (grp.label) {
      case game.i18n.localize('TOKEN.BarAttributes'):
        grp.innerHTML = `<option value="size">${game.i18n.localize(
          'KNW.Warfare.Statistics.size.long'
        )}</option>`;
        break;
      case game.i18n.localize('TOKEN.BarValues'):
        grp.innerHTML = ['attacks', 'def', 'tou']
          .map(
            (abbr) =>
              `<option value="${abbr}">${game.i18n.localize(
                `KNW.Warfare.Statistics.${abbr}.long`
              )}</option>`
          )
          .join('')
          .concat(
            `<option value="tier">${game.i18n.localize(
              'KNW.Warfare.Tier'
            )}</option>`
          );
        break;
      case game.i18n.localize('DND5E.MovementSpeeds'):
        grp.innerHTML = `<option value="mov">${game.i18n.localize(
          'KNW.Warfare.Statistics.mov.long'
        )}</option>`;
        break;
    }
  }
}
