export const MODULE = {
    ID: 'token-action-hud-animabf'
}

export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

export const REQUIRED_CORE_MODULE_VERSION = '2.1'

export const ACTION_TYPE = {
    combat: 'tokenActionHud.animabf.combat',
    weapon: 'tokenActionHud.animabf.weapons',
    spell: 'tokenActionHud.animabf.spells',
    psychicPower: 'tokenActionHud.animabf.psychicPowers',
    secondary: 'tokenActionHud.animabf.secondaryAbility',
    resistance: 'tokenActionHud.animabf.resistance',
    kiSkill: 'tokenActionHud.animabf.kiSkills',
    technique: 'tokenActionHud.animabf.techniques',
    initiative: 'tokenActionHud.animabf.initiative',
    utility: 'tokenActionHud.utility'
}

export const GROUP = {
    // Combat
    combatSkills: { id: 'combat-skills', name: 'tokenActionHud.animabf.combatSkills', type: 'system' },
    weapons: { id: 'weapons', name: 'tokenActionHud.animabf.weapons', type: 'system' },
    armors: { id: 'armors', name: 'tokenActionHud.animabf.armors', type: 'system' },

    // Mystic
    spells: { id: 'spells', name: 'tokenActionHud.animabf.spells', type: 'system' },
    summoning: { id: 'summoning', name: 'tokenActionHud.animabf.summoning', type: 'system' },

    // Psychic
    psychicPowers: { id: 'psychic-powers', name: 'tokenActionHud.animabf.psychicPowers', type: 'system' },

    // Domine
    kiSkills: { id: 'ki-skills', name: 'tokenActionHud.animabf.kiSkills', type: 'system' },
    techniques: { id: 'techniques', name: 'tokenActionHud.animabf.techniques', type: 'system' },
    martialArts: { id: 'martial-arts', name: 'tokenActionHud.animabf.martialArts', type: 'system' },

    // Secondary Abilities
    athletics: { id: 'athletics', name: 'tokenActionHud.animabf.athletics', type: 'system' },
    vigor: { id: 'vigor', name: 'tokenActionHud.animabf.vigor', type: 'system' },
    perception: { id: 'perception', name: 'tokenActionHud.animabf.perception', type: 'system' },
    intellectual: { id: 'intellectual', name: 'tokenActionHud.animabf.intellectual', type: 'system' },
    social: { id: 'social', name: 'tokenActionHud.animabf.social', type: 'system' },
    subterfuge: { id: 'subterfuge', name: 'tokenActionHud.animabf.subterfuge', type: 'system' },
    creative: { id: 'creative', name: 'tokenActionHud.animabf.creative', type: 'system' },

    // Attributes
    characteristics: { id: 'characteristics', name: 'tokenActionHud.animabf.characteristics', type: 'system' },
    resistances: { id: 'resistances', name: 'tokenActionHud.animabf.resistances', type: 'system' },
    initiative: { id: 'initiative', name: 'tokenActionHud.animabf.initiative', type: 'system' },

    // Utility
    combat: { id: 'combat', name: 'tokenActionHud.combat', type: 'system' },
    token: { id: 'token', name: 'tokenActionHud.token', type: 'system' },
    utility: { id: 'utility', name: 'tokenActionHud.utility', type: 'system' }
}

export const SECONDARY_ABILITIES = {
    athletics: ['acrobatics', 'athleticism', 'ride', 'swim', 'climb', 'jump', 'piloting'],
    vigor: ['composure', 'featsOfStrength', 'withstandPain'],
    perception: ['notice', 'search', 'track'],
    intellectual: ['animals', 'science', 'law', 'herbalLore', 'history', 'tactics', 'medicine', 'memorize', 'navigation', 'occult', 'appraisal', 'magicAppraisal'],
    social: ['style', 'intimidate', 'leadership', 'persuasion', 'trading', 'streetwise', 'etiquette'],
    subterfuge: ['lockPicking', 'disguise', 'hide', 'theft', 'stealth', 'trapLore', 'poisons'],
    creative: ['art', 'dance', 'forging', 'runes', 'alchemy', 'animism', 'music', 'sleightOfHand', 'ritualCalligraphy', 'jewelry', 'tailoring', 'puppetMaking']
}

export const RESISTANCES = ['physical', 'disease', 'poison', 'magic', 'psychic']

export const CHARACTERISTICS = ['agility', 'constitution', 'dexterity', 'strength', 'intelligence', 'perception', 'power', 'willPower']
