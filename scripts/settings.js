import { MODULE } from './constants.js'

export function register (updateFunc) {
    game.settings.register(MODULE.ID, 'showWeaponDetails', {
        name: game.i18n.localize('tokenActionHud.animabf.setting.showWeaponDetails.name'),
        hint: game.i18n.localize('tokenActionHud.animabf.setting.showWeaponDetails.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => { updateFunc(value) }
    })

    game.settings.register(MODULE.ID, 'showSpellGrades', {
        name: game.i18n.localize('tokenActionHud.animabf.setting.showSpellGrades.name'),
        hint: game.i18n.localize('tokenActionHud.animabf.setting.showSpellGrades.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => { updateFunc(value) }
    })
}
