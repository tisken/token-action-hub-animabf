import { SECONDARY_ABILITIES, RESISTANCES, CHARACTERISTICS } from './constants.js'
import { getSetting } from './utils.js'

export function createActionHandlerClass (coreModule) {
    return class ActionHandler extends coreModule.api.ActionHandler {
        /** @override */
        async buildSystemActions (groupIds) {
            this.actorType = this.actor?.type
            if (this.actorType !== 'character') return

            await Promise.all([
                this.#buildCombatSkills(),
                this.#buildWeapons(),
                this.#buildArmors(),
                this.#buildSpells(),
                this.#buildSummoning(),
                this.#buildPsychicPowers(),
                this.#buildKiSkills(),
                this.#buildTechniques(),
                this.#buildMartialArts(),
                this.#buildSecondaryAbilities(),
                this.#buildCharacteristics(),
                this.#buildResistances(),
                this.#buildInitiative(),
                this.#buildUtility()
            ])
        }

        #buildCombatSkills () {
            const combat = this.actor.system.combat
            const actions = []

            const attackVal = combat.attack?.final?.value ?? 0
            actions.push({
                id: 'combat-attack',
                name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.attack')} (${attackVal})`,
                encodedValue: ['combat', 'attack'].join('|')
            })

            const blockVal = combat.block?.final?.value ?? 0
            actions.push({
                id: 'combat-block',
                name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.block')} (${blockVal})`,
                encodedValue: ['combat', 'block'].join('|')
            })

            const dodgeVal = combat.dodge?.final?.value ?? 0
            actions.push({
                id: 'combat-dodge',
                name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.dodge')} (${dodgeVal})`,
                encodedValue: ['combat', 'dodge'].join('|')
            })

            this.addActions(actions, { id: 'combat-skills', type: 'system' })
        }

        #buildWeapons () {
            const weapons = this.actor.items.filter(i => i.type === 'weapon')
            if (!weapons.length) return

            const showDetails = getSetting('showWeaponDetails', true)
            const actions = weapons.map(w => {
                const atk = w.system.attack?.final?.value ?? 0
                const dmg = w.system.damage?.final?.value ?? 0
                const info = showDetails ? ` [${atk}/${dmg}]` : ''
                return {
                    id: w.id,
                    name: `${w.name}${info}`,
                    encodedValue: ['weapon', w.id].join('|'),
                    img: w.img
                }
            })

            this.addActions(actions, { id: 'weapons', type: 'system' })
        }

        #buildArmors () {
            const armors = this.actor.items.filter(i => i.type === 'armor')
            if (!armors.length) return

            const actions = armors.map(a => ({
                id: a.id,
                name: a.name,
                encodedValue: ['armor', a.id].join('|'),
                img: a.img
            }))

            this.addActions(actions, { id: 'armors', type: 'system' })
        }

        #buildSpells () {
            const spells = this.actor.items.filter(i => i.type === 'spell')
            if (!spells.length) return

            const showGrades = getSetting('showSpellGrades', true)

            if (showGrades) {
                const grades = ['base', 'intermediate', 'advanced', 'arcane']
                const actions = []
                for (const spell of spells) {
                    for (const grade of grades) {
                        const gradeData = spell.system.grades?.[grade]
                        const zeon = gradeData?.zeon?.value ?? 0
                        if (zeon <= 0) continue
                        const gradeName = coreModule.api.Utils.i18n(`tokenActionHud.animabf.grade.${grade}`)
                        actions.push({
                            id: `${spell.id}-${grade}`,
                            name: `${spell.name} (${gradeName})`,
                            encodedValue: ['spell', `${spell.id}>${grade}`].join('|'),
                            img: spell.img,
                            info1: { text: `${zeon}z` }
                        })
                    }
                }
                this.addActions(actions, { id: 'spells', type: 'system' })
            } else {
                const actions = spells.map(s => ({
                    id: s.id,
                    name: s.name,
                    encodedValue: ['spell', `${s.id}>base`].join('|'),
                    img: s.img
                }))
                this.addActions(actions, { id: 'spells', type: 'system' })
            }
        }

        #buildSummoning () {
            const summoning = this.actor.system.mystic?.summoning
            if (!summoning) return

            const actions = ['summon', 'banish', 'bind', 'control'].map(key => {
                const val = summoning[key]?.final?.value ?? 0
                return {
                    id: `summoning-${key}`,
                    name: `${coreModule.api.Utils.i18n(`tokenActionHud.animabf.${key}`)} (${val})`,
                    encodedValue: ['summoning', key].join('|')
                }
            })

            this.addActions(actions, { id: 'summoning', type: 'system' })
        }

        #buildPsychicPowers () {
            const powers = this.actor.items.filter(i => i.type === 'psychicPower')
            if (!powers.length) return

            const actions = powers.map(p => ({
                id: p.id,
                name: p.name,
                encodedValue: ['psychicPower', p.id].join('|'),
                img: p.img
            }))

            this.addActions(actions, { id: 'psychic-powers', type: 'system' })
        }

        #buildKiSkills () {
            const skills = this.actor.system.domine?.kiSkills ?? []
            if (!skills.length) return

            const actions = skills.map(s => ({
                id: s._id,
                name: s.name,
                encodedValue: ['kiSkill', s._id].join('|')
            }))

            this.addActions(actions, { id: 'ki-skills', type: 'system' })
        }

        #buildTechniques () {
            const techniques = this.actor.items.filter(i => i.type === 'technique')
            if (!techniques.length) return

            const actions = techniques.map(t => ({
                id: t.id,
                name: t.name,
                encodedValue: ['technique', t.id].join('|'),
                img: t.img
            }))

            this.addActions(actions, { id: 'techniques', type: 'system' })
        }

        #buildMartialArts () {
            const arts = this.actor.system.domine?.martialArts ?? []
            if (!arts.length) return

            const actions = arts.map(a => ({
                id: a._id,
                name: a.name,
                encodedValue: ['martialArt', a._id].join('|')
            }))

            this.addActions(actions, { id: 'martial-arts', type: 'system' })
        }

        #buildSecondaryAbilities () {
            for (const [groupKey, abilities] of Object.entries(SECONDARY_ABILITIES)) {
                const groupData = this.actor.system.secondaries?.[groupKey]
                if (!groupData) continue

                const actions = abilities
                    .filter(a => groupData[a])
                    .map(a => {
                        const val = groupData[a].final?.value ?? 0
                        const name = coreModule.api.Utils.i18n(`tokenActionHud.animabf.secondary.${a}`)
                        return {
                            id: `secondary-${a}`,
                            name: `${name} (${val})`,
                            encodedValue: ['secondary', a].join('|')
                        }
                    })

                this.addActions(actions, { id: groupKey, type: 'system' })
            }
        }

        #buildCharacteristics () {
            const primaries = this.actor.system.characteristics?.primaries
            if (!primaries) return

            const actions = CHARACTERISTICS
                .filter(c => primaries[c])
                .map(c => {
                    const val = primaries[c].final?.value ?? primaries[c].value ?? 0
                    const name = coreModule.api.Utils.i18n(`tokenActionHud.animabf.characteristic.${c}`)
                    return {
                        id: `char-${c}`,
                        name: `${name} (${val})`,
                        encodedValue: ['characteristic', c].join('|')
                    }
                })

            this.addActions(actions, { id: 'characteristics', type: 'system' })
        }

        #buildResistances () {
            const resistances = this.actor.system.characteristics?.secondaries?.resistances
            if (!resistances) return

            const actions = RESISTANCES
                .filter(r => resistances[r])
                .map(r => {
                    const val = resistances[r].final?.value ?? 0
                    const name = coreModule.api.Utils.i18n(`tokenActionHud.animabf.resistance.${r}`)
                    return {
                        id: `res-${r}`,
                        name: `${name} (${val})`,
                        encodedValue: ['resistance', r].join('|')
                    }
                })

            this.addActions(actions, { id: 'resistances', type: 'system' })
        }

        #buildInitiative () {
            const init = this.actor.system.characteristics?.secondaries?.initiative
            if (!init) return

            const val = init.final?.value ?? 0
            const actions = [{
                id: 'initiative',
                name: `${coreModule.api.Utils.i18n('tokenActionHud.animabf.initiative')} (${val})`,
                encodedValue: ['initiative', 'initiative'].join('|')
            }]

            this.addActions(actions, { id: 'initiative', type: 'system' })
        }

        #buildUtility () {
            const combatActions = [{
                id: 'endTurn',
                name: coreModule.api.Utils.i18n('tokenActionHud.endTurn'),
                encodedValue: ['utility', 'endTurn'].join('|')
            }]
            this.addActions(combatActions, { id: 'combat', type: 'system' })

            const tokenActions = [
                {
                    id: 'toggleVisibility',
                    name: coreModule.api.Utils.i18n('tokenActionHud.toggleVisibility'),
                    encodedValue: ['utility', 'toggleVisibility'].join('|')
                },
                {
                    id: 'toggleCombat',
                    name: coreModule.api.Utils.i18n('tokenActionHud.toggleCombat'),
                    encodedValue: ['utility', 'toggleCombat'].join('|')
                }
            ]
            this.addActions(tokenActions, { id: 'token', type: 'system' })
        }
    }
}
