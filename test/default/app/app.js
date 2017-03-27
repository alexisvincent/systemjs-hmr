import a from "./a.js"
import {module} from '@hot'

console.log('::', module)

// export const __reload = (m) => {
//   console.log(":::",m)
// }

export const __reload = (m) => {
  console.log('old reload', m)

}

console.log('./app.js - initialising')
console.log(`./app.js - imported from a: '${a}'`)

export const lol = 'assdfasdfasdfasdfas'
