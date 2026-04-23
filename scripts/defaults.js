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
                id: 'combat-tab',
                name: coreModule.api.Utils.i18n('tokenActionHud.animabf.combatTab'),
                groups: [
                    { ...groups.combatSkills, nestId: 'combat_combat-skills' },
                    { ...groups.weapons, nestId: 'combat_weapons' },
                    { ...groups.armors, nestId: 'combat_armors' }
                ]
            },
            {
                nestId: 'mystic',
                id: 'mystic-tab',
                name: coreModule.api.Utils.i18n('tokenActionHud.animabf.mysticTab'),
                groups: [
                    { ...groups.spells, nestId: 'mystic_spells' },
                    { ...groups.summoning, nestId: 'mystic_summoning' }
                ]
            },
            {
                nestId: 'psychic',
                id: 'psychic-tab',
                name: coreModule.api.Utils.i18n('tokenActionHud.animabf.psychicTab'),
                groups: [
                    { ...groups.psychicPowers, nestId: 'psychic_psychic-powers' }
                ]
            },
            {
                nestId: 'domine',
                id: 'domine-tab',
                name: coreModule.api.Utils.i18n('tokenActionHud.animabf.domineTab'),
                groups: [
                    { ...groups.kiSkills, nestId: 'domine_ki-skills' },
                    { ...groups.techniques, nestId: 'domine_techniques' },
                    { ...groups.martialArts, nestId: 'domine_martial-arts' }
                ]
            },
            {
                nestId: 'secondaries',
                id: 'secondaries-tab',
                name: coreModule.api.Utils.i18n('tokenActionHud.animabf.secondariesTab'),
                groups: [
                    { ...groups.athletics, nestId: 'secondaries_athletics' },
                    { ...groups.vigor, nestId: 'secondaries_vigor' },
                    { ...groups.perception, nestId: 'secondaries_perception' },
                    { ...groups.intellectual, nestId: 'secondaries_intellectual' },
                    { ...groups.social, nestId: 'secondaries_social' },
                    { ...groups.subterfuge, nestId: 'secondaries_subterfuge' },
                    { ...groups.creative, nestId: 'secondaries_creative' }
                ]
            },
            {
                nestId: 'attributes',
                id: 'attributes-tab',
                name: coreModule.api.Utils.i18n('tokenActionHud.animabf.attributesTab'),
                groups: [
                    { ...groups.characteristics, nestId: 'attributes_characteristics' },
                    { ...groups.resistances, nestId: 'attributes_resistances' },
                    { ...groups.initiative, nestId: 'attributes_initiative' }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility-tab',
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
