import { SECONDARY_ABILITIES, RESISTANCES, CHARACTERISTICS } from './constants.js'
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const i = (key) => game.i18n.localize(key)

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
            return (m.zeon?.max ?? 0) > 0 || this.#getFinal(m.magicProjection) > 0
        }

        #hasPsychic () {
            const p = this.actor.system.psychic
            if (!p) return false
            return this.#getFinal(p.psychicPotential) > 0 || this.#getFinal(p.psychicProjection) > 0
        }

        #buildCombatSkills () {
            const combat = this.actor.system.combat
            if (!combat) return
            const atkVal = this.#getFinal(combat.attack)
            const blkVal = this.#getFinal(combat.block)
            const dodVal = this.#getFinal(combat.dodge)
            const actions = []
            if (atkVal > 0) actions.push({ id: 'combat-attack', name: `${i('anima.ui.combat.baseValues.attack.title')} (${atkVal})`, encodedValue: 'combat|attack' })
            if (blkVal > 0) actions.push({ id: 'combat-block', name: `${i('anima.ui.combat.baseValues.block.title')} (${blkVal})`, encodedValue: 'combat|block' })
            if (dodVal > 0 || actions.length === 0) actions.push({ id: 'combat-dodge', name: `${i('anima.ui.combat.baseValues.dodge.title')} (${dodVal})`, encodedValue: 'combat|dodge' })
            this.addActions(actions, { id: 'combat-skills', type: 'system' })
        }

        #buildWeapons () {
            const weapons = this.actor.items.filter(w => w.type === 'weapon')
            if (!weapons.length) return
            const showDetails = Utils.getSetting('showWeaponDetails', true)
            const actions = weapons.map(w => {
                const info = showDetails ? ` [${this.#getFinal(w.system.attack)}/${this.#getFinal(w.system.damage)}]` : ''
                return { id: w.id, name: `${w.name}${info}`, encodedValue: `weapon|${w.id}`, img: w.img }
            })
            this.addActions(actions, { id: 'weapons', type: 'system' })
        }

        #buildArmors () {
            const armors = this.actor.items.filter(a => a.type === 'armor')
            if (!armors.length) return
            const actions = armors.map(a => ({ id: a.id, name: a.name, encodedValue: `armor|${a.id}`, img: a.img }))
            this.addActions(actions, { id: 'armors', type: 'system' })
        }

        #buildSpells () {
            if (!this.#hasMystic()) return
            const mystic = this.actor.system.mystic

            // Projection group
            const projActions = []
            const mpOff = this.#getFinal(mystic.magicProjection?.imbalance?.offensive)
            const mpDef = this.#getFinal(mystic.magicProjection?.imbalance?.defensive)
            if (mpOff > 0 || mpDef > 0) {
                projActions.push({ id: 'magic-projection-off', name: `PM Ofn. (${mpOff})`, encodedValue: 'magicProjection|offensive' })
                projActions.push({ id: 'magic-projection-def', name: `PM Def. (${mpDef})`, encodedValue: 'magicProjection|defensive' })
            }
            if (projActions.length) this.addActions(projActions, { id: 'spells', type: 'system' })

            // Spell book group — sorted by level
            const spells = this.actor.items.filter(s => s.type === 'spell')
            if (!spells.length) return
            const sorted = [...spells].sort((a, b) => (a.system.level?.value ?? 0) - (b.system.level?.value ?? 0))
            const showGrades = Utils.getSetting('showSpellGrades', true)
            const GRADE_LABELS = { base: 'Base', intermediate: 'Int.', advanced: 'Avz.', arcane: 'Arc.' }
            const bookActions = []
            if (showGrades) {
                for (const spell of sorted) {
                    for (const grade of ['base', 'intermediate', 'advanced', 'arcane']) {
                        const zeon = this.#val(spell.system.grades?.[grade]?.zeon)
                        if (zeon <= 0) continue
                        const lvl = spell.system.level?.value ?? 0
                        bookActions.push({ id: `${spell.id}-${grade}`, name: `[${lvl}] ${spell.name} (${GRADE_LABELS[grade]})`, encodedValue: `spell|${spell.id}>${grade}`, img: spell.img, info1: { text: `${zeon}z` } })
                    }
                }
            } else {
                for (const s of sorted) {
                    const lvl = s.system.level?.value ?? 0
                    bookActions.push({ id: s.id, name: `[${lvl}] ${s.name}`, encodedValue: `spell|${s.id}>base`, img: s.img })
                }
            }
            if (bookActions.length) this.addActions(bookActions, { id: 'spell-book', type: 'system' })
        }

        #buildSummoning () {
            if (!this.#hasMystic()) return
            const summoning = this.actor.system.mystic?.summoning
            if (!summoning) return
            const LABELS = { summon: 'Invocar', banish: 'Desterrar', bind: 'Atar', control: 'Controlar' }
            const actions = ['summon', 'banish', 'bind', 'control']
                .filter(key => this.#getFinal(summoning[key]) > 0)
                .map(key => ({ id: `summoning-${key}`, name: `${LABELS[key]} (${this.#getFinal(summoning[key])})`, encodedValue: `summoning|${key}` }))
            if (actions.length) this.addActions(actions, { id: 'summoning', type: 'system' })
        }

        #buildPsychicPowers () {
            if (!this.#hasPsychic()) return
            const psychic = this.actor.system.psychic

            // Projection group
            const projActions = []
            const ppOff = this.#getFinal(psychic.psychicProjection?.imbalance?.offensive)
            const ppDef = this.#getFinal(psychic.psychicProjection?.imbalance?.defensive)
            if (ppOff > 0 || ppDef > 0) {
                projActions.push({ id: 'psychic-projection-off', name: `PP Ofn. (${ppOff})`, encodedValue: 'psychicProjection|offensive' })
                projActions.push({ id: 'psychic-projection-def', name: `PP Def. (${ppDef})`, encodedValue: 'psychicProjection|defensive' })
            }
            if (projActions.length) this.addActions(projActions, { id: 'psychic-powers', type: 'system' })

            // Mental powers group — sorted by level
            const powers = this.actor.items.filter(p => p.type === 'psychicPower')
            if (!powers.length) return
            const sorted = [...powers].sort((a, b) => (a.system.level?.value ?? 0) - (b.system.level?.value ?? 0))
            const mentalActions = sorted.map(p => ({ id: p.id, name: p.name, encodedValue: `psychicPower|${p.id}`, img: p.img }))
            if (mentalActions.length) this.addActions(mentalActions, { id: 'mental-powers', type: 'system' })
        }

        #buildKiSkills () {
            const skills = this.actor.system.domine?.kiSkills ?? []
            if (!skills.length) return
            const actions = skills.map(s => ({ id: s._id, name: s.name, encodedValue: `kiSkill|${s._id}` }))
            this.addActions(actions, { id: 'ki-skills', type: 'system' })
        }

        #buildTechniques () {
            const techniques = this.actor.items.filter(t => t.type === 'technique')
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
                        name: `${i(`anima.ui.secondaries.${a}.title`)} (${this.#getFinal(groupData[a])})`,
                        encodedValue: `secondary|${a}`
                    }))
                if (actions.length) this.addActions(actions, { id: groupKey, type: 'system' })
            }
        }

        #buildCharacteristics () {
            const primaries = this.actor.system.characteristics?.primaries
            if (!primaries) return
            const actions = CHARACTERISTICS.filter(c => primaries[c]).map(c => ({
                id: `char-${c}`,
                name: `${i(`anima.ui.characteristics.${c}`)} (${this.#getFinal(primaries[c])})`,
                encodedValue: `characteristic|${c}`
            }))
            if (actions.length) this.addActions(actions, { id: 'characteristics', type: 'system' })
        }

        #buildResistances () {
            const resistances = this.actor.system.characteristics?.secondaries?.resistances
            if (!resistances) return
            const LABELS = { physical: 'RF', disease: 'RE', poison: 'RV', magic: 'RM', psychic: 'RP' }
            const actions = RESISTANCES.filter(r => resistances[r]).map(r => ({
                id: `res-${r}`, name: `${LABELS[r]} (${this.#getFinal(resistances[r])})`, encodedValue: `resistance|${r}`
            }))
            if (actions.length) this.addActions(actions, { id: 'resistances', type: 'system' })
        }

        #buildInitiative () {
            const init = this.actor.system.characteristics?.secondaries?.initiative
            if (!init) return
            this.addActions([{ id: 'initiative', name: `${i('anima.ui.characteristics.secondaries.initiative.title') !== 'anima.ui.characteristics.secondaries.initiative.title' ? i('anima.ui.characteristics.secondaries.initiative.title') : 'Iniciativa'} (${this.#getFinal(init)})`, encodedValue: 'initiative|initiative' }], { id: 'initiative', type: 'system' })
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
