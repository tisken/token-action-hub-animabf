import { SECONDARY_ABILITIES, RESISTANCES, CHARACTERISTICS } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /** @override */
        async buildSystemActions (groupIds) {
            if (!this.actor) return

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

        #hasMystic () {
            const m = this.actor.system.mystic
            if (!m) return false
            const zeonMax = m.zeon?.max ?? 0
            const mpBase = this.#getFinal(m.magicProjection)
            return zeonMax > 0 || mpBase > 0
        }

        #hasPsychic () {
            const p = this.actor.system.psychic
            if (!p) return false
            const ppBase = this.#getFinal(p.psychicPotential)
            const projBase = this.#getFinal(p.psychicProjection)
            return ppBase > 0 || projBase > 0
        }

        #buildCombatSkills () {
            const combat = this.actor.system.combat
            if (!combat) return

            const atkVal = this.#getFinal(combat.attack)
            const blkVal = this.#getFinal(combat.block)
            const dodVal = this.#getFinal(combat.dodge)

            const actions = []
            if (atkVal > 0) actions.push({ id: 'combat-attack', name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.attack')} (${atkVal})`, encodedValue: 'combat|attack' })
            if (blkVal > 0) actions.push({ id: 'combat-block', name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.block')} (${blkVal})`, encodedValue: 'combat|block' })

            // Always show dodge: if none are developed, show dodge as fallback
            if (dodVal > 0 || actions.length === 0) {
                actions.push({ id: 'combat-dodge', name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.dodge')} (${dodVal})`, encodedValue: 'combat|dodge' })
            }

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
            if (!this.#hasMystic()) return

            const mystic = this.actor.system.mystic
            const actions = []

            // Magic Projection
            const mpOff = this.#getFinal(mystic.magicProjection?.imbalance?.offensive)
            const mpDef = this.#getFinal(mystic.magicProjection?.imbalance?.defensive)
            if (mpOff > 0 || mpDef > 0) {
                actions.push({
                    id: 'magic-projection-off',
                    name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.magicProjectionOff')} (${mpOff})`,
                    encodedValue: 'magicProjection|offensive'
                })
                actions.push({
                    id: 'magic-projection-def',
                    name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.magicProjectionDef')} (${mpDef})`,
                    encodedValue: 'magicProjection|defensive'
                })
            }

            // Spells by grade
            const spells = this.actor.items.filter(i => i.type === 'spell')
            const showGrades = Utils.getSetting('showSpellGrades', true)
            if (spells.length && showGrades) {
                const grades = ['base', 'intermediate', 'advanced', 'arcane']
                for (const spell of spells) {
                    for (const grade of grades) {
                        const zeon = this.#val(spell.system.grades?.[grade]?.zeon)
                        if (zeon <= 0) continue
                        const gradeName = coreModule.api.Utils.i18n(`tokenActionHud.animabf.grade.${grade}`)
                        actions.push({ id: `${spell.id}-${grade}`, name: `${spell.name} (${gradeName})`, encodedValue: `spell|${spell.id}>${grade}`, img: spell.img, info1: { text: `${zeon}z` } })
                    }
                }
            } else if (spells.length) {
                for (const s of spells) {
                    actions.push({ id: s.id, name: s.name, encodedValue: `spell|${s.id}>base`, img: s.img })
                }
            }

            if (actions.length) this.addActions(actions, { id: 'spells', type: 'system' })
        }

        #buildSummoning () {
            if (!this.#hasMystic()) return
            const summoning = this.actor.system.mystic?.summoning
            if (!summoning) return
            const actions = ['summon', 'banish', 'bind', 'control']
                .filter(key => this.#getFinal(summoning[key]) > 0)
                .map(key => ({
                    id: `summoning-${key}`,
                    name: `${coreModule.api.Utils.i18n(`tokenActionHud.animabf.${key}`)} (${this.#getFinal(summoning[key])})`,
                    encodedValue: `summoning|${key}`
                }))
            if (actions.length) this.addActions(actions, { id: 'summoning', type: 'system' })
        }

        #buildPsychicPowers () {
            if (!this.#hasPsychic()) return

            const psychic = this.actor.system.psychic
            const actions = []

            // Psychic Projection
            const ppOff = this.#getFinal(psychic.psychicProjection?.imbalance?.offensive)
            const ppDef = this.#getFinal(psychic.psychicProjection?.imbalance?.defensive)
            if (ppOff > 0 || ppDef > 0) {
                actions.push({
                    id: 'psychic-projection-off',
                    name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.psychicProjectionOff')} (${ppOff})`,
                    encodedValue: 'psychicProjection|offensive'
                })
                actions.push({
                    id: 'psychic-projection-def',
                    name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.psychicProjectionDef')} (${ppDef})`,
                    encodedValue: 'psychicProjection|defensive'
                })
            }

            // Powers
            const powers = this.actor.items.filter(i => i.type === 'psychicPower')
            for (const p of powers) {
                actions.push({ id: p.id, name: p.name, encodedValue: `psychicPower|${p.id}`, img: p.img })
            }

            if (actions.length) this.addActions(actions, { id: 'psychic-powers', type: 'system' })
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
                const actions = abilities
                    .filter(a => groupData[a] && this.#getFinal(groupData[a]) > 0)
                    .map(a => ({
                        id: `secondary-${a}`,
                        name: `${coreModule.api.Utils.i18n(`tokenActionHud.animabf.secondary.${a}`)} (${this.#getFinal(groupData[a])})`,
                        encodedValue: `secondary|${a}`
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
