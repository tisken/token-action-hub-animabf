import { MODULE } from './constants.js'

export function getSetting (key, defaultValue = null) {
    let value = defaultValue ?? null
    try {
        value = game.settings.get(MODULE.ID, key)
    } catch {
        // Setting not found
    }
    return value
}
