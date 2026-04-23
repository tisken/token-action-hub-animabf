export function createRollHandlerClass (coreModule) {
    return class RollHandler extends coreModule.api.RollHandler {
        /** @override */
        async handleActionClick (event, encodedPayload) {
            const payload = decodeURIComponent(encodedPayload).split('|', 2)
            if (payload.length < 2) return super.throwInvalidValueErr()

            const [actionType, actionId] = payload

            if (this.isRenderItem() && ['weapon', 'armor', 'spell', 'psychicPower', 'technique'].includes(actionType)) {
                const itemId = actionId.split('>')[0]
                return this.renderItem(this.actor, itemId)
            }

            if (this.actor) {
                await this.#handleAction(event, actionType, this.actor, this.token, actionId)
            } else {
                for (const token of canvas.tokens.controlled) {
                    if (token.actor) {
                        await this.#handleAction(event, actionType, token.actor, token, actionId)
                    }
                }
            }
        }

        async #handleAction (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'combat':
                await this.#rollCombat(actor, actionId)
                break
            case 'weapon':
                await this.#rollWeaponAttack(actor, actionId)
                break
            case 'armor':
                this.renderItem(actor, actionId)
                break
            case 'spell':
                await this.#castSpell(actor, actionId)
                break
            case 'psychicPower':
                await this.#castPsychicPower(actor, actionId)
                break
            case 'secondary':
                await this.#rollSecondary(actor, actionId)
                break
            case 'resistance':
                await this.#rollResistance(actor, actionId)
                break
            case 'characteristic':
                await this.#rollCharacteristic(actor, actionId)
                break
            case 'initiative':
                await this.#rollInitiative(actor)
                break
            case 'summoning':
                await this.#rollSummoning(actor, actionId)
                break
            case 'utility':
                await this.#performUtility(token, actionId)
                break
            }
        }

        async #rollCombat (actor, actionId) {
            const combat = actor.system.combat
            const val = combat[actionId]?.final?.value ?? 0
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            const label = game.i18n.localize(`tokenActionHud.animabf.${actionId}`)
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: label
            })
        }

        async #rollWeaponAttack (actor, weaponId) {
            const weapon = actor.items.get(weaponId)
            if (!weapon) return

            const sheet = actor.sheet
            if (sheet) {
                const fakeEvent = { currentTarget: { dataset: { weaponId } }, shiftKey: false }
                try {
                    const mod = await import(
                        /* webpackIgnore: true */
                        '../../../systems/animabf/module/actor/utils/buttonCallbacks/createWeaponAttack.js'
                    )
                    mod.createWeaponAttack(sheet, fakeEvent)
                    return
                } catch { /* fallback */ }
            }

            const atk = weapon.system.attack?.final?.value ?? 0
            const die = atk >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${atk}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: `${weapon.name} — ${game.i18n.localize('tokenActionHud.animabf.attack')}`
            })
        }

        async #castSpell (actor, actionId) {
            const [spellId, grade] = actionId.split('>', 2)
            const spell = actor.items.get(spellId)
            if (!spell) return

            const sheet = actor.sheet
            if (sheet) {
                const fakeEvent = { currentTarget: { dataset: { spellId, grade } }, shiftKey: false }
                try {
                    const mod = await import(
                        /* webpackIgnore: true */
                        '../../../systems/animabf/module/actor/utils/buttonCallbacks/castSpellGrade.js'
                    )
                    await mod.castSpellGrade(sheet, fakeEvent)
                    return
                } catch { /* fallback */ }
            }

            const mp = actor.system.mystic?.magicProjection?.imbalance?.offensive?.base?.value ?? 0
            const die = mp >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${mp}`, actor.getRollData())
            await roll.evaluate()
            const gradeName = game.i18n.localize(`tokenActionHud.animabf.grade.${grade}`)
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: `${spell.name} (${gradeName})`
            })
        }

        async #castPsychicPower (actor, powerId) {
            const power = actor.items.get(powerId)
            if (!power) return

            const sheet = actor.sheet
            if (sheet) {
                const fakeEvent = { currentTarget: { dataset: { powerId } }, shiftKey: false }
                try {
                    const mod = await import(
                        /* webpackIgnore: true */
                        '../../../systems/animabf/module/actor/utils/buttonCallbacks/castPsychicPower.js'
                    )
                    await mod.castPsychicPower(sheet, fakeEvent)
                    return
                } catch { /* fallback */ }
            }

            const pp = actor.system.psychic?.psychicPotential?.final?.value ?? 0
            const roll = new Roll(`1d100 + ${pp}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: `${power.name} — Potencial`
            })
        }

        async #rollSecondary (actor, abilityKey) {
            if (typeof actor.rollAbility === 'function') {
                await actor.rollAbility(abilityKey)
                return
            }

            const { secondaries } = actor.system
            let val = 0
            for (const groupKey in secondaries) {
                if (secondaries[groupKey]?.[abilityKey]) {
                    val = secondaries[groupKey][abilityKey].final?.value ?? 0
                    break
                }
            }
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: abilityKey
            })
        }

        async #rollResistance (actor, resistanceKey) {
            const val = actor.system.characteristics?.secondaries?.resistances?.[resistanceKey]?.final?.value ?? 0
            const roll = new Roll(`1d100 + ${val}`, actor.getRollData())
            await roll.evaluate()
            const name = game.i18n.localize(`tokenActionHud.animabf.resistance.${resistanceKey}`)
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: name
            })
        }

        async #rollCharacteristic (actor, charKey) {
            const charData = actor.system.characteristics?.primaries?.[charKey]
            const val = charData?.final?.value ?? charData?.value ?? 0
            const die = actor.system.general?.diceSettings?.characteristicDie?.value ?? '1d10'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            const name = game.i18n.localize(`tokenActionHud.animabf.characteristic.${charKey}`)
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: name
            })
        }

        async #rollInitiative (actor) {
            if (actor.inCombat) {
                await actor.rollInitiative({ createCombatants: false })
            } else {
                await actor.rollInitiative({ createCombatants: true })
            }
        }

        async #rollSummoning (actor, summonType) {
            const val = actor.system.mystic?.summoning?.[summonType]?.final?.value ?? 0
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            const name = game.i18n.localize(`tokenActionHud.animabf.${summonType}`)
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor }),
                flavor: name
            })
        }

        async #performUtility (token, actionId) {
            switch (actionId) {
            case 'endTurn':
                if (game.combat?.current?.tokenId === token.id) {
                    await game.combat?.nextTurn()
                }
                break
            case 'toggleVisibility':
                await token.document?.update({ hidden: !token.document?.hidden })
                break
            case 'toggleCombat':
                await token.toggleCombat()
                break
            }
        }
    }
}
