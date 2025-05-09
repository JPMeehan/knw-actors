# Changelog

## 2.0.1

- Fixed overly-strict uniqueness on org dev editors per org
- Added window icon to the org dev editor

## 2.0.0

- Major rewrite for Foundry v13
  - Updated sheets to use ActorSheetV2

## 1.4.1

- Fixed "Use Prof" checkbox not working on the Org Sheet Test Roll

## 1.4.0

- Adjusted status effect handling so Warfare units now *only* show the Warfare conditions (#8)
- Increased system minimum version to 4.3 & marked v12 maximum
- Removed ability for users with Limited permissions to view an Organization sheet
- Updated uses of Dialog to DialogV2
- Adjusted code to account for system deprecations
- Added Kingdoms & Warfare to registered source books as "K&W"
- Added labels to data model fields

## 1.3.0

- Updated minimum version to v12 and resolved related deprecations

## 1.2.3

- Warfare token sheets now provide the appropriate options for attribute bars and single values again (#18)
- Fixed erroneous implementation that linked Defense Levels to Defense Score (#23)

## 1.2.2

- Various code cleanups
- Improved error handling to allow removing deleted actors from organizations
- Fixed bug with rolling Warfare unit stats caused by previous refactor (#22)

## 1.2.1

- Updated namespace for the actor sheets to use the module ID
- Changed the `commander` field on Warfare from a StringField to a ForeignDocumentField.
  - This means that `unit.commander` will return an actor rather than the ID.
  - Refactored a number of sheet functions to account for this change.
- Added missing Levy icon and fixed d6.svg (#17)
- Item and effect descriptions now display as a simple tooltip on hover on the warfare sheet. (#19)

## 1.2.0

- Updated minimum `dnd5e` system version to 3.0
- Added edit button to items on warfare sheets now that they can render properly (#15)
  - Note: Items don't DO anything besides minimally display
- Warfare units now roll as themselves (#5)
- Warfare and Organization sheet rolls now accept standard 5e key modifiers to speed up rolls
  - Shift to roll normally
  - Ctrl to roll with disadvantage
  - Alt to roll with advantage

## 1.1.0 Derived Stats

- [BREAKING] Organization skill bonuses and defense scores are now derived from their allocated development points (#6)
- Warfare units now have an Items and Active Effects tab. (#7)
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
