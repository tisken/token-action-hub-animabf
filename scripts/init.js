import { SystemManager } from './system-manager.js'
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from './constants.js'

console.log('TAH AnimaBF | Module script loaded')

Hooks.on('tokenActionHudCoreApiReady', async () => {
    console.log('TAH AnimaBF | tokenActionHudCoreApiReady fired')
    console.log('TAH AnimaBF | SystemManager is:', SystemManager)
    const module = game.modules.get(MODULE.ID)
    console.log('TAH AnimaBF | module found:', !!module)
    module.api = {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager
    }
    console.log('TAH AnimaBF | Calling tokenActionHudSystemReady')
    Hooks.call('tokenActionHudSystemReady', module)
})
