/**
 * Created by 18680666@sun.ac.za on 2017/02/17.
 */
// Maintain a reference to all properties of the unpatched SystemJS object
// Whenever using _System, bind in the System object. So for example
_System.normalize.apply(System, ["someModule"])
const _System = {
  __proto__: {
    __proto__: {
      ...System.__proto__.__proto__
    },
    ...System.__proto__,
  },
  ...System
}

System.resolveSync = function (moduleName, parentName, parentAddress) {
  if (moduleName == '@hot') return normalizeHot(parentName)
  else return System.__proto__.resolveSync.apply(System, [moduleName, parentName, parentAddress])
}

System.normalizeSync = function (moduleName, parentName, parentAddress) {
  if (moduleName == '@hot') return normalizeHot(parentName)
  else return System.__proto__.normalizeSync.apply(System, [moduleName, parentName, parentAddress])
}

if (is20) {
  System.has = (moduleName) => System.registry.has(moduleName)
  System.get = (moduleName) => System.registry.get(moduleName)
  System.delete = (moduleName) => System.registry.delete(moduleName)
  System.set = (moduleName) => System.registry.set(moduleName)
}

/**
 * Backwards comparability for old __reload mechanism
 * @param key
 * @param parent
 */
// System.import = function(key, parent) {
//   if (System.has(getHotName(key))) {
//
//   }
// }
