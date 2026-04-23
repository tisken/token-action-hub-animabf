import { SECONDARY_ABILITIES, RESISTANCES, CHARACTERISTICS } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /** @override */
        async buildSystemActions (groupIds) {
            console.log('TAH AnimaBF | buildSystemActions called')
            console.log('TAH AnimaBF | actor:', this.actor)
            console.log('TAH AnimaBF | actor.type:', this.actor?.type)
            console.log('TAH AnimaBF | actor.system keys:', this.actor?.system ? Object.keys(this.actor.system) : 'no system')
            if (!this.actor) { console.log('TAH AnimaBF | No actor, returning'); return }

            const builders = [
                () => this.#buildCombatSkills(),
                () => this.#buildWeapons(),
                () => this.#buildArmors(),
                () => this.#buildSpells(),
                () => this.#buildSummoning(),
                () => this.#buildPsychicPowers(),
                () => this.#buildKiSkills(),
                () => this.#buildTechniques(),
                () => this.#buildMartialArts(),
                () => this.#buildSecondaryAbilities(),
                () => this.#buildCharacteristics(),
                () => this.#buildResistances(),
                () => this.#buildInitiative(),
                () => this.#buildUtility()
            ]
            console.log('TAH AnimaBF | groupHandler groups:', Object.keys(this.groupHandler.groups))
            console.log('TAH AnimaBF | groupHandler group ids:', Object.values(this.groupHandler.groups).map(g => g.id + ' [' + g.type + '] nestId=' + g.nestId))
            for (const fn of builders) {
                try { await fn() } catch (e) { console.error('TAH AnimaBF |', e) }
            }
        }

        #val (obj) {
            if (obj == null) return 0
            if (typeof obj === 'number') return obj
            if (typeof obj === 'object' && 'value' in obj) return Number(obj.value) || 0
            return Number(obj) || 0
        }

        #getFinal (node) {
            if (node == null) return 0
            if (typeof node.final === 'number') return node.final
            if (node.final && typeof node.final === 'object') return this.#val(node.final)
            return this.#val(node)
        }

        #buildCombatSkills () {
            const combat = this.actor.system.combat
            if (!combat) return
            const actions = [
                { id: 'combat-attack', name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.attack')} (${this.#getFinal(combat.attack)})`, encodedValue: 'combat|attack' },
                { id: 'combat-block', name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.block')} (${this.#getFinal(combat.block)})`, encodedValue: 'combat|block' },
                { id: 'combat-dodge', name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.dodge')} (${this.#getFinal(combat.dodge)})`, encodedValue: 'combat|dodge' }
            ]
            console.log('TAH AnimaBF | #buildCombatSkills adding', actions.length, 'actions to combat-skills')
            const found = this.groupHandler.getGroups({ id: 'combat-skills', type: 'system' })
            console.log('TAH AnimaBF | groups matching combat-skills:', found.length, found.map(g => g.nestId))
            this.addActions(actions, { id: 'combat-skills', type: 'system' })
        }

        #buildWeapons () {
            const weapons = this.actor.items.filter(i => i.type === 'weapon')
            if (!weapons.length) return
            const showDetails = Utils.getSetting('showWeaponDetails', true)
            const actions = weapons.map(w => {
                const info = showDetails ? ` [${this.#getFinal(w.system.attack)}/${this.#getFinal(w.system.damage)}]` : ''
                return { id: w.id, name: `${w.name}${info}`, encodedValue: `weapon|${w.id}`, img: w.img }
            })
            this.addActions(actions, { id: 'weapons', type: 'system' })
        }

        #buildArmors () {
            const armors = this.actor.items.filter(i => i.type === 'armor')
            if (!armors.length) return
            const actions = armors.map(a => ({ id: a.id, name: a.name, encodedValue: `armor|${a.id}`, img: a.img }))
            this.addActions(actions, { id: 'armors', type: 'system' })
        }

        #buildSpells () {
            const spells = this.actor.items.filter(i => i.type === 'spell')
            if (!spells.length) return
            const showGrades = Utils.getSetting('showSpellGrades', true)
            if (showGrades) {
                const grades = ['base', 'intermediate', 'advanced', 'arcane']
                const actions = []
                for (const spell of spells) {
                    for (const grade of grades) {
                        const zeon = this.#val(spell.system.grades?.[grade]?.zeon)
                        if (zeon <= 0) continue
                        const gradeName = coreModule.api.Utils.i18n(`tokenActionHud.animabf.grade.${grade}`)
                        actions.push({ id: `${spell.id}-${grade}`, name: `${spell.name} (${gradeName})`, encodedValue: `spell|${spell.id}>${grade}`, img: spell.img, info1: { text: `${zeon}z` } })
                    }
                }
                if (actions.length) this.addActions(actions, { id: 'spells', type: 'system' })
            } else {
                const actions = spells.map(s => ({ id: s.id, name: s.name, encodedValue: `spell|${s.id}>base`, img: s.img }))
                this.addActions(actions, { id: 'spells', type: 'system' })
            }
        }

        #buildSummoning () {
            const summoning = this.actor.system.mystic?.summoning
            if (!summoning) return
            const actions = ['summon', 'banish', 'bind', 'control'].map(key => ({
                id: `summoning-${key}`, name: `${coreModule.api.Utils.i18n(`tokenActionHud.animabf.${key}`)} (${this.#getFinal(summoning[key])})`, encodedValue: `summoning|${key}`
            }))
            this.addActions(actions, { id: 'summoning', type: 'system' })
        }

        #buildPsychicPowers () {
            const powers = this.actor.items.filter(i => i.type === 'psychicPower')
            if (!powers.length) return
            const actions = powers.map(p => ({ id: p.id, name: p.name, encodedValue: `psychicPower|${p.id}`, img: p.img }))
            this.addActions(actions, { id: 'psychic-powers', type: 'system' })
        }

        #buildKiSkills () {
            const skills = this.actor.system.domine?.kiSkills ?? []
            if (!skills.length) return
            const actions = skills.map(s => ({ id: s._id, name: s.name, encodedValue: `kiSkill|${s._id}` }))
            this.addActions(actions, { id: 'ki-skills', type: 'system' })
        }

        #buildTechniques () {
            const techniques = this.actor.items.filter(i => i.type === 'technique')
            if (!techniques.length) return
            const actions = techniques.map(t => ({ id: t.id, name: t.name, encodedValue: `technique|${t.id}`, img: t.img }))
            this.addActions(actions, { id: 'techniques', type: 'system' })
        }

        #buildMartialArts () {
            const arts = this.actor.system.domine?.martialArts ?? []
            if (!arts.length) return
            const actions = arts.map(a => ({ id: a._id, name: a.name, encodedValue: `martialArt|${a._id}` }))
            this.addActions(actions, { id: 'martial-arts', type: 'system' })
        }

        #buildSecondaryAbilities () {
            for (const [groupKey, abilities] of Object.entries(SECONDARY_ABILITIES)) {
                const groupData = this.actor.system.secondaries?.[groupKey]
                if (!groupData) continue
                const actions = abilities.filter(a => groupData[a]).map(a => ({
                    id: `secondary-${a}`, name: `${coreModule.api.Utils.i18n(`tokenActionHud.animabf.secondary.${a}`)} (${this.#getFinal(groupData[a])})`, encodedValue: `secondary|${a}`
                }))
                if (actions.length) this.addActions(actions, { id: groupKey, type: 'system' })
            }
        }

        #buildCharacteristics () {
            const primaries = this.actor.system.characteristics?.primaries
            if (!primaries) return
            const actions = CHARACTERISTICS.filter(c => primaries[c]).map(c => ({
                id: `char-${c}`, name: `${coreModule.api.Utils.i18n(`tokenActionHud.animabf.characteristic.${c}`)} (${this.#getFinal(primaries[c])})`, encodedValue: `characteristic|${c}`
            }))
            if (actions.length) this.addActions(actions, { id: 'characteristics', type: 'system' })
        }

        #buildResistances () {
            const resistances = this.actor.system.characteristics?.secondaries?.resistances
            if (!resistances) return
            const actions = RESISTANCES.filter(r => resistances[r]).map(r => ({
                id: `res-${r}`, name: `${coreModule.api.Utils.i18n(`tokenActionHud.animabf.resistance.${r}`)} (${this.#getFinal(resistances[r])})`, encodedValue: `resistance|${r}`
            }))
            if (actions.length) this.addActions(actions, { id: 'resistances', type: 'system' })
        }

        #buildInitiative () {
            const init = this.actor.system.characteristics?.secondaries?.initiative
            if (!init) return
            this.addActions([{ id: 'initiative', name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.initiative')} (${this.#getFinal(init)})`, encodedValue: 'initiative|initiative' }], { id: 'initiative', type: 'system' })
        }

        #buildUtility () {
            this.addActions([{ id: 'endTurn', name: coreModule.api.Utils.i18n('tokenActionHud.endTurn'), encodedValue: 'utility|endTurn' }], { id: 'combat', type: 'system' })
            this.addActions([
                { id: 'toggleVisibility', name: coreModule.api.Utils.i18n('tokenActionHud.toggleVisibility'), encodedValue: 'utility|toggleVisibility' },
                { id: 'toggleCombat', name: coreModule.api.Utils.i18n('tokenActionHud.toggleCombat'), encodedValue: 'utility|toggleCombat' }
            ], { id: 'token', type: 'system' })
        }
    }
})
