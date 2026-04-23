import { MODULE, REQUIRED_CORE_MODULE_VERSION } from './constants.js'
import { createActionHandlerClass } from './action-handler.js'
import { createRollHandlerClass } from './roll-handler.js'
import { buildDefaults } from './defaults.js'
import { register as registerSettings } from './settings.js'

Hooks.on('tokenActionHudCoreApiReady', async (coreModule) => {
    const ActionHandler = createActionHandlerClass(coreModule)
    const RollHandler = createRollHandlerClass(coreModule)
    const defaults = buildDefaults(coreModule)

    const SystemManagerClass = class SystemManager extends coreModule.api.SystemManager {
        /** @override */
        getActionHandler () {
            return new ActionHandler()
        }

        /** @override */
        getAvailableRollHandlers () {
            return { core: 'Core Anima Beyond Fantasy' }
        }

        /** @override */
        getRollHandler (rollHandlerId) {
            return new RollHandler()
        }

        /** @override */
        registerSettings (onChangeFunction) {
            registerSettings(onChangeFunction)
        }

        /** @override */
        async registerDefaults () {
            return defaults
        }
    }

    const module = game.modules.get(MODULE.ID)
    module.api = {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager: SystemManagerClass
    }
    Hooks.call('tokenActionHudSystemReady', module)
})
