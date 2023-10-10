const KNWCONFIG = {
  DND5E: {},
  KNW: {
    CHOICES: {
      EXPERIENCE: {
        levy: "KNW.Warfare.Experience.levy",
        regular: "KNW.Warfare.Experience.regular",
        veteran: "KNW.Warfare.Experience.veteran",
        elite: "KNW.Warfare.Experience.elite",
        superElite: "KNW.Warfare.Experience.super-elite",
      },
      GEAR: {
        light: "KNW.Warfare.Gear.light",
        medium: "KNW.Warfare.Gear.medium",
        heavy: "KNW.Warfare.Gear.heavy",
        superHeavy: "KNW.Warfare.Gear.super-heavy",
      },
      TYPE: {
        aerial: {
          label: "KNW.Warfare.Type.aerial",
          img: "modules/knw-actors/assets/icons/aerial.png",
        },
        artillery: {
          label: "KNW.Warfare.Type.artillery",
          img: "modules/knw-actors/assets/icons/artillery.png",
        },
        artillerySiege: {
          label: "KNW.Warfare.Type.artillery-siege",
          img: "modules/knw-actors/assets/icons/artillery-siege.png",
        },
        cavalry: {
          label: "KNW.Warfare.Type.cavalry",
          img: "modules/knw-actors/assets/icons/cavalry.png",
        },
        infantry: {
          label: "KNW.Warfare.Type.infantry",
          img: "modules/knw-actors/assets/icons/infantry.png",
        },
      },
      TIER: {
        1: "Ⅰ",
        2: "Ⅱ",
        3: "Ⅲ",
        4: "Ⅳ",
        5: "Ⅴ",
      },
      COMMUNICATIONS: {
        "-3": "KNW.Organization.com.-3",
        "-2": "KNW.Organization.com.-2",
        "-1": "KNW.Organization.com.-1",
        0: "KNW.Organization.com.0",
        1: "KNW.Organization.com.1",
        2: "KNW.Organization.com.2",
        3: "KNW.Organization.com.3",
      },
      RESOLVE: {
        "-3": "KNW.Organization.rlv.-3",
        "-2": "KNW.Organization.rlv.-2",
        "-1": "KNW.Organization.rlv.-1",
        0: "KNW.Organization.rlv.0",
        1: "KNW.Organization.rlv.1",
        2: "KNW.Organization.rlv.2",
        3: "KNW.Organization.rlv.3",
      },
      RESOURCES: {
        "-3": "KNW.Organization.rsc.-3",
        "-2": "KNW.Organization.rsc.-2",
        "-1": "KNW.Organization.rsc.-1",
        0: "KNW.Organization.rsc.0",
        1: "KNW.Organization.rsc.1",
        2: "KNW.Organization.rsc.2",
        3: "KNW.Organization.rsc.3",
      },
      SIZE: {
        1: { powerDie: 4, diePath: "modules/knw-actors/assets/dice/d4.svg" },
        2: { powerDie: 6, diePath: "modules/knw-actors/assets/dice/d6.svg" },
        3: { powerDie: 8, diePath: "modules/knw-actors/assets/dice/d8.svg" },
        4: { powerDie: 10, diePath: "modules/knw-actors/assets/dice/d10.svg" },
        5: { powerDie: 12, diePath: "modules/knw-actors/assets/dice/d12.svg" },
      },
    },
  },
};

export default KNWCONFIG;
