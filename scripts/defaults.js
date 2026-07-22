import { GROUP } from './constants.js'

export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
        layout: [
            {
                nestId: 'combat',
                id: 'combat',
                name: 'Combate',
                groups: [
                    { ...groups.combatSkills, nestId: 'combat_combat-skills' },
                    { ...groups.weapons, nestId: 'combat_weapons', settings: { collapse: true } },
                    { ...groups.armors, nestId: 'combat_armors', settings: { collapse: true } }
                ]
            },
            {
                nestId: 'mystic',
                id: 'mystic',
                name: 'Místico',
                groups: [
                    { ...groups.spells, nestId: 'mystic_spells', settings: { collapse: true } },
                    { ...groups.summoning, nestId: 'mystic_summoning', settings: { collapse: true } }
                ]
            },
            {
                nestId: 'psychic',
                id: 'psychic',
                name: 'Psíquico',
                groups: [
                    { ...groups.psychicPowers, nestId: 'psychic_psychic-powers', settings: { collapse: true } }
                ]
            },
            {
                nestId: 'domine',
                id: 'domine',
                name: 'Dominio',
                groups: [
                    { ...groups.kiSkills, nestId: 'domine_ki-skills', settings: { collapse: true } },
                    { ...groups.techniques, nestId: 'domine_techniques', settings: { collapse: true } },
                    { ...groups.martialArts, nestId: 'domine_martial-arts', settings: { collapse: true } }
                ]
            },
            {
                nestId: 'secondaries',
                id: 'secondaries',
                name: 'Secundarias',
                groups: [
                    { ...groups.athletics, nestId: 'secondaries_athletics', settings: { collapse: true } },
                    { ...groups.vigor, nestId: 'secondaries_vigor', settings: { collapse: true } },
                    { ...groups.perception, nestId: 'secondaries_perception', settings: { collapse: true } },
                    { ...groups.intellectual, nestId: 'secondaries_intellectual', settings: { collapse: true } },
                    { ...groups.social, nestId: 'secondaries_social', settings: { collapse: true } },
                    { ...groups.subterfuge, nestId: 'secondaries_subterfuge', settings: { collapse: true } },
                    { ...groups.creative, nestId: 'secondaries_creative', settings: { collapse: true } }
                ]
            },
            {
                nestId: 'attributes',
                id: 'attributes',
                name: 'Atributos',
                groups: [
                    { ...groups.characteristics, nestId: 'attributes_characteristics', settings: { collapse: true } },
                    { ...groups.resistances, nestId: 'attributes_resistances', settings: { collapse: true } },
                    { ...groups.initiative, nestId: 'attributes_initiative', settings: { collapse: true } }
                ]
            },
            {
                nestId: 'effects',
                id: 'effects',
                name: 'Efectos',
                groups: [
                    { ...groups.effects, nestId: 'effects_effects-list', settings: { collapse: true } }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
                groups: [
                    { ...groups.combat, nestId: 'utility_combat' },
                    { ...groups.token, nestId: 'utility_token' },
                    { ...groups.utility, nestId: 'utility_utility' }
                ]
            }
        ],
        groups: groupsArray
    }
})
