export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /** @override */
        async handleActionClick (event, encodedPayload) {
            const payload = decodeURIComponent(encodedPayload).split('|', 2)
            if (payload.length < 2) return super.throwInvalidValueErr()
            const [actionType, actionId] = payload

            if (this.isRenderItem() && ['weapon', 'armor', 'spell', 'psychicPower', 'technique'].includes(actionType)) {
                return this.renderItem(this.actor, actionId.split('>')[0])
            }

            if (this.actor) {
                await this.#handleAction(event, actionType, this.actor, this.token, actionId)
            } else {
                for (const token of canvas.tokens.controlled) {
                    if (token.actor) await this.#handleAction(event, actionType, token.actor, token, actionId)
                }
            }
        }

        async #handleAction (event, actionType, actor, token, actionId) {
            switch (actionType) {
            case 'combat': await this.#rollCombat(actor, actionId); break
            case 'weapon': await this.#rollWeaponAttack(actor, actionId); break
            case 'armor': this.renderItem(actor, actionId); break
            case 'spell': await this.#castSpell(actor, actionId); break
            case 'psychicPower': await this.#castPsychicPower(actor, actionId); break
            case 'secondary': await this.#rollSecondary(actor, actionId); break
            case 'resistance': await this.#rollResistance(actor, actionId); break
            case 'characteristic': await this.#rollCharacteristic(actor, actionId); break
            case 'initiative': await this.#rollInitiative(actor); break
            case 'summoning': await this.#rollSummoning(actor, actionId); break
            case 'utility': await this.#performUtility(token, actionId); break
            }
        }

        async #rollCombat (actor, actionId) {
            const val = actor.system.combat?.[actionId]?.final?.value ?? 0
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: game.i18n.localize(`tokenActionHud.animabf.${actionId}`) })
        }

        async #rollWeaponAttack (actor, weaponId) {
            const weapon = actor.items.get(weaponId)
            if (!weapon) return
            const atk = weapon.system.attack?.final?.value ?? 0
            const die = atk >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${atk}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `${weapon.name} — ${game.i18n.localize('tokenActionHud.animabf.attack')}` })
        }

        async #castSpell (actor, actionId) {
            const [spellId, grade] = actionId.split('>', 2)
            const spell = actor.items.get(spellId)
            if (!spell) return
            const mp = actor.system.mystic?.magicProjection?.imbalance?.offensive?.base?.value ?? 0
            const die = mp >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${mp}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `${spell.name} (${game.i18n.localize(`tokenActionHud.animabf.grade.${grade}`)})` })
        }

        async #castPsychicPower (actor, powerId) {
            const power = actor.items.get(powerId)
            if (!power) return
            const pp = actor.system.psychic?.psychicPotential?.final?.value ?? 0
            const roll = new Roll(`1d100 + ${pp}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `${power.name} — Potencial` })
        }

        async #rollSecondary (actor, abilityKey) {
            if (typeof actor.rollAbility === 'function') { await actor.rollAbility(abilityKey); return }
            const { secondaries } = actor.system
            let val = 0
            for (const g in secondaries) { if (secondaries[g]?.[abilityKey]) { val = secondaries[g][abilityKey].final?.value ?? 0; break } }
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: abilityKey })
        }

        async #rollResistance (actor, key) {
            const val = actor.system.characteristics?.secondaries?.resistances?.[key]?.final?.value ?? 0
            const roll = new Roll(`1d100 + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: game.i18n.localize(`tokenActionHud.animabf.resistance.${key}`) })
        }

        async #rollCharacteristic (actor, key) {
            const ch = actor.system.characteristics?.primaries?.[key]
            const val = ch?.final?.value ?? ch?.value ?? 0
            const die = actor.system.general?.diceSettings?.characteristicDie?.value ?? '1d10'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: game.i18n.localize(`tokenActionHud.animabf.characteristic.${key}`) })
        }

        async #rollInitiative (actor) {
            await actor.rollInitiative({ createCombatants: !actor.inCombat })
        }

        async #rollSummoning (actor, key) {
            const val = actor.system.mystic?.summoning?.[key]?.final?.value ?? 0
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: game.i18n.localize(`tokenActionHud.animabf.${key}`) })
        }

        async #performUtility (token, actionId) {
            switch (actionId) {
            case 'endTurn': if (game.combat?.current?.tokenId === token.id) await game.combat?.nextTurn(); break
            case 'toggleVisibility': await token.document?.update({ hidden: !token.document?.hidden }); break
            case 'toggleCombat': await token.toggleCombat(); break
            }
        }
    }
})
