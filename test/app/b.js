/**
 * Created by alexisvincent on 2016/11/05.
 */

import { module, _state } from '@hot'

console.log("state", _state)

_state.inc = _state.inc || 0
_state.inc++

if (module) {
    module.__unload()
    console.log("Module State", module.state)
}

export const __unload = () => console.log("lol")

export const state = "two"
