# Changelog

## 1.1.0 Derived Stats

- [BREAKING] Organization skill bonuses and defense scores are now derived from their allocated development points
- Warfare units now have an Items and Active Effects tab.
  - KNOWN ISSUE: Item sheets CANNOT be rendered from a warfare unit due to upstream issue in dnd5e (https://github.com/foundryvtt/dnd5e/issues/2698)

## 1.0.0 Full Release

- Updated SVG files to have defined height and width for firefox users
- Long power and feature descriptions now have scrollbars when they overflow (#9)
- Changed permission handling for the power pool; players can take rolled dice from anyone, but the extended rest and rolling functions require you to own the relevant character (#10)
- Added checkbox confirming proficiency bonus usage on domain skill tests (#13)

## 0.9.0 Beta Release

- Support for Organizations and Warfare Units!
- Organizations do not currently support deriving skill bonuses or defense scores
- Warfare units do not currently support carrying items or having active effects
- Hopefully D&D 2.4 will allow those two features to be implemented
