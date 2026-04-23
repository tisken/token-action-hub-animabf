import { ActionHandler } from './action-handler.js'
import { RollHandler as Core } from './roll-handler.js'
import { DEFAULTS } from './defaults.js'
import * as systemSettings from './settings.js'

export let SystemManager = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    console.log('TAH AnimaBF | system-manager Hooks.once fired')
    console.log('TAH AnimaBF | coreModule.api.SystemManager:', coreModule.api.SystemManager)
    SystemManager = class SystemManager extends coreModule.api.SystemManager {
        /** @override */
        getActionHandler () {
            console.log('TAH AnimaBF | getActionHandler called, ActionHandler is:', ActionHandler)
            return new ActionHandler()
        }

        /** @override */
        getAvailableRollHandlers () {
            return { core: 'Core Anima Beyond Fantasy' }
        }

        /** @override */
        getRollHandler (rollHandlerId) {
            return new Core()
        }

        /** @override */
        registerSettings (onChangeFunction) {
            systemSettings.register(onChangeFunction)
        }

        /** @override */
        async registerDefaults () {
            console.log('TAH AnimaBF | registerDefaults called, DEFAULTS is:', DEFAULTS)
            return DEFAULTS
        }
    }
    console.log('TAH AnimaBF | SystemManager class created:', !!SystemManager)
})
