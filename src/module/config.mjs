const KNWCONFIG = {
  DND5E: {
    sourceBooks: {
      "K&W": "Kingdoms & Warfare"
    }
  },
  KNW: {
    CHOICES: {
      EXPERIENCE: {
        levy: "KNW.Warfare.Experience.levy",
        regular: "KNW.Warfare.Experience.regular",
        veteran: "KNW.Warfare.Experience.veteran",
        elite: "KNW.Warfare.Experience.elite",
        superElite: "KNW.Warfare.Experience.super-elite"
      },
      GEAR: {
        light: "KNW.Warfare.Gear.light",
        medium: "KNW.Warfare.Gear.medium",
        heavy: "KNW.Warfare.Gear.heavy",
        superHeavy: "KNW.Warfare.Gear.super-heavy"
      },
      TYPE: {
        aerial: {
          label: "KNW.Warfare.Type.aerial",
          img: "modules/knw-actors/assets/icons/aerial.png"
        },
        artillery: {
          label: "KNW.Warfare.Type.artillery",
          img: "modules/knw-actors/assets/icons/artillery.png"
        },
        artillerySiege: {
          label: "KNW.Warfare.Type.artillery-siege",
          img: "modules/knw-actors/assets/icons/artillery-siege.png"
        },
        cavalry: {
          label: "KNW.Warfare.Type.cavalry",
          img: "modules/knw-actors/assets/icons/cavalry.png"
        },
        infantry: {
          label: "KNW.Warfare.Type.infantry",
          img: "modules/knw-actors/assets/icons/infantry.png"
        }
      },
      TIER: {
        1: "Ⅰ",
        2: "Ⅱ",
        3: "Ⅲ",
        4: "Ⅳ",
        5: "Ⅴ"
      },
      com: [
        {value: -3, label: "KNW.Organization.defenses.com.-3"},
        {value: -2, label: "KNW.Organization.defenses.com.-2"},
        {value: -1, label: "KNW.Organization.defenses.com.-1"},
        {value: 0, label: "KNW.Organization.defenses.com.0"},
        {value: 1, label: "KNW.Organization.defenses.com.1"},
        {value: 2, label: "KNW.Organization.defenses.com.2"},
        {value: 3, label: "KNW.Organization.defenses.com.3"}
      ],
      rlv: [
        {value: -3, label: "KNW.Organization.defenses.rlv.-3"},
        {value: -2, label: "KNW.Organization.defenses.rlv.-2"},
        {value: -1, label: "KNW.Organization.defenses.rlv.-1"},
        {value: 0, label: "KNW.Organization.defenses.rlv.0"},
        {value: 1, label: "KNW.Organization.defenses.rlv.1"},
        {value: 2, label: "KNW.Organization.defenses.rlv.2"},
        {value: 3, label: "KNW.Organization.defenses.rlv.3"}
      ],
      rsc: [
        {value: -3, label: "KNW.Organization.defenses.rsc.-3"},
        {value: -2, label: "KNW.Organization.defenses.rsc.-2"},
        {value: -1, label: "KNW.Organization.defenses.rsc.-1"},
        {value: 0, label: "KNW.Organization.defenses.rsc.0"},
        {value: 1, label: "KNW.Organization.defenses.rsc.1"},
        {value: 2, label: "KNW.Organization.defenses.rsc.2"},
        {value: 3, label: "KNW.Organization.defenses.rsc.3"}
      ],
      SIZE: {
        1: {powerDie: 4, diePath: "modules/knw-actors/assets/dice/d4.svg"},
        2: {powerDie: 6, diePath: "modules/knw-actors/assets/dice/d6.svg"},
        3: {powerDie: 8, diePath: "modules/knw-actors/assets/dice/d8.svg"},
        4: {powerDie: 10, diePath: "modules/knw-actors/assets/dice/d10.svg"},
        5: {powerDie: 12, diePath: "modules/knw-actors/assets/dice/d12.svg"}
      }
    },
    ORGANIZATION: {
      assocSkills: {
        // Related skills for each Organization Skill
        dip: ["ins", "per"],
        esp: ["inv", "ste"],
        lor: ["arc", "his", "rel"],
        opr: ["ath", "ins"]
      },
      tracks: {
        skills: [-1, 0, 1, 2, 2, 3, 3, 3, 4],
        defenses: [10, 11, 12, 13, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18]
      }
    }
  }
};

export default KNWCONFIG;
