/**
 * Created by alexisvincent on 2016/11/05.
 */

import { module } from '@hot'

if (module)
    console.log("Module State", module.state)

console.log("b.js second")

const state = "two"

export {state}

export default "b.js exported string"