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
            case 'spell': await this.#castSpell(actor, actionId, event); break
            case 'magicProjection': await this.#rollMagicProjection(actor, actionId); break
            case 'psychicPower': await this.#castPsychicPower(actor, actionId); break
            case 'psychicProjection': await this.#rollPsychicProjection(actor, actionId); break
            case 'technique': await this.#showTechnique(actor, actionId); break
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
            const LABELS = { attack: 'anima.ui.combat.baseValues.attack.title', block: 'anima.ui.combat.baseValues.block.title', dodge: 'anima.ui.combat.baseValues.dodge.title' }
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: game.i18n.localize(LABELS[actionId] ?? actionId) })
        }

        async #rollWeaponAttack (actor, weaponId) {
            const weapon = actor.items.get(weaponId)
            if (!weapon) return

            // Try to call createWeaponAttack via the system's click handler registry
            const sheet = actor.sheet
            if (sheet) {
                const fakeEvent = {
                    currentTarget: { dataset: { weaponId } },
                    preventDefault: () => {},
                    shiftKey: false
                }
                try {
                    // Use absolute URL to import from the system
                    const mod = await import('/systems/animabf/module/actor/utils/buttonCallbacks/createWeaponAttack.js')
                    if (mod?.createWeaponAttack) {
                        mod.createWeaponAttack(sheet, fakeEvent)
                        return
                    }
                } catch (e) {
                    console.warn('TAH AnimaBF | Direct import failed, trying registry', e)
                }

                // Alternative: try the click handler registry
                try {
                    const regMod = await import('/systems/animabf/module/actor/utils/createClickHandlers.js')
                    if (regMod?.clickHandlerRegistry?.createWeaponAttack) {
                        regMod.clickHandlerRegistry.createWeaponAttack(fakeEvent)
                        return
                    }
                } catch (e) {
                    console.warn('TAH AnimaBF | Registry import failed', e)
                }
            }

            // Fallback: simple roll
            const atk = weapon.system.attack?.final?.value ?? 0
            const die = atk >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${atk}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `${weapon.name} — ${game.i18n.localize('tokenActionHud.animabf.attack')}` })
        }

        async #castSpell (actor, actionId, event) {
            // Check if user clicked a specific grade span
            let spellId, grade
            const gradeEl = event?.target?.closest?.('.tah-abf-grade') ?? event?.target?.querySelector?.('.tah-abf-grade')
            if (gradeEl?.dataset?.spellId && gradeEl?.dataset?.grade) {
                spellId = gradeEl.dataset.spellId
                grade = gradeEl.dataset.grade
            } else {
                [spellId, grade] = actionId.split('>', 2)
            }
            const spell = actor.items.get(spellId)
            if (!spell) return

            const sheet = actor.sheet
            if (sheet) {
                try {
                    const mod = await import('/systems/animabf/module/actor/utils/buttonCallbacks/castSpellGrade.js')
                    if (mod?.castSpellGrade) {
                        const fakeEvent = { currentTarget: { dataset: { spellId, grade: grade || 'base' } }, shiftKey: true, preventDefault: () => {} }
                        await mod.castSpellGrade(sheet, fakeEvent)
                        return
                    }
                } catch (e) { console.warn('TAH AnimaBF | castSpellGrade fallback', e) }
            }

            const mp = actor.system.mystic?.magicProjection?.imbalance?.offensive?.base?.value ?? 0
            const die = mp >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${mp}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: spell.name })
        }

        async #rollMagicProjection (actor, side) {
            const imbalance = actor.system.mystic?.magicProjection?.imbalance
            const node = side === 'offensive' ? imbalance?.offensive : imbalance?.defensive
            const val = node?.base?.value ?? node?.final?.value ?? 0
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            const label = side === 'offensive'
                ? game.i18n.localize('tokenActionHud.animabf.magicProjectionOff')
                : game.i18n.localize('tokenActionHud.animabf.magicProjectionDef')
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: label })
        }

        async #castPsychicPower (actor, powerId) {
            const power = actor.items.get(powerId)
            if (!power) return

            // Try system's castPsychicPower
            const sheet = actor.sheet
            if (sheet) {
                try {
                    const mod = await import('/systems/animabf/module/actor/utils/buttonCallbacks/castPsychicPower.js')
                    if (mod?.castPsychicPower) {
                        const fakeEvent = { currentTarget: { dataset: { powerId } }, shiftKey: false, preventDefault: () => {} }
                        await mod.castPsychicPower(sheet, fakeEvent)
                        return
                    }
                } catch (e) { console.warn('TAH AnimaBF | castPsychicPower fallback', e) }
            }

            // Fallback
            const pp = actor.system.psychic?.psychicPotential?.final?.value ?? 0
            const roll = new Roll(`1d100 + ${pp}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `${power.name} — Potencial` })
        }

        async #rollPsychicProjection (actor, side) {
            const imbalance = actor.system.psychic?.psychicProjection?.imbalance
            const node = side === 'offensive' ? imbalance?.offensive : imbalance?.defensive
            const val = node?.base?.value ?? node?.final?.value ?? 0
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            const label = side === 'offensive'
                ? game.i18n.localize('tokenActionHud.animabf.psychicProjectionOff')
                : game.i18n.localize('tokenActionHud.animabf.psychicProjectionDef')
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: label })
        }

        async #showTechnique (actor, techniqueId) {
            const technique = actor.items.get(techniqueId)
            if (!technique) return
            const desc = technique.system.description?.value || ''
            const kiCosts = []
            const STATS = { strength: 'FUE', agility: 'AGI', dexterity: 'DES', constitution: 'CON', willPower: 'VOL', power: 'POD' }
            for (const [stat, label] of Object.entries(STATS)) {
                const cost = technique.system[stat]?.value ?? 0
                if (cost > 0) kiCosts.push(`${label}: ${cost}`)
            }
            const mk = technique.system.martialKnowledge?.value ?? 0
            const costLine = kiCosts.length ? `<p><strong>Ki:</strong> ${kiCosts.join(' | ')}${mk ? ` | MK: ${mk}` : ''}</p>` : ''
            const content = `<h3>${technique.name}</h3>${costLine}${desc ? `<p>${desc}</p>` : ''}`
            await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content })
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
            const LABELS = { physical: 'RF', disease: 'RE', poison: 'RV', magic: 'RM', psychic: 'RP' }
            const val = actor.system.characteristics?.secondaries?.resistances?.[key]?.final?.value ?? 0
            const label = LABELS[key] ?? key
            const roll = new Roll(`1d100 + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `${label} (${val})` })
        }

        async #rollCharacteristic (actor, key) {
            const ch = actor.system.characteristics?.primaries?.[key]
            const val = ch?.final?.value ?? ch?.value ?? 0
            const die = actor.system.general?.diceSettings?.characteristicDie?.value ?? '1d10'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: game.i18n.localize(`anima.ui.characteristics.${key}`) })
        }

        async #rollInitiative (actor) {
            await actor.rollInitiative({ createCombatants: !actor.inCombat })
        }

        async #rollSummoning (actor, key) {
            const val = actor.system.mystic?.summoning?.[key]?.final?.value ?? 0
            const die = val >= 200 ? '1d100xamastery' : '1d100xa'
            const roll = new Roll(`${die} + ${val}`, actor.getRollData())
            await roll.evaluate()
            const SLABELS = { summon: 'Invocar', banish: 'Desterrar', bind: 'Atar', control: 'Controlar' }
            await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: SLABELS[key] ?? key })
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
