'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Created by 18680666@sun.ac.za on 2017/02/17.
 */
// Maintain a reference to all properties of the unpatched SystemJS object
// Whenever using _System, bind in the System object. So for example
_System.normalize.apply(System, ["someModule"]);
var _System = _extends({
  __proto__: _extends({
    __proto__: _extends({}, System.__proto__.__proto__)
  }, System.__proto__)
}, System);

System.resolveSync = function (moduleName, parentName, parentAddress) {
  if (moduleName == '@hot') return normalizeHot(parentName);else return System.__proto__.resolveSync.apply(System, [moduleName, parentName, parentAddress]);
};

System.normalizeSync = function (moduleName, parentName, parentAddress) {
  if (moduleName == '@hot') return normalizeHot(parentName);else return System.__proto__.normalizeSync.apply(System, [moduleName, parentName, parentAddress]);
};

if (is20) {
  System.has = function (moduleName) {
    return System.registry.has(moduleName);
  };
  System.get = function (moduleName) {
    return System.registry.get(moduleName);
  };
  System.delete = function (moduleName) {
    return System.registry.delete(moduleName);
  };
  System.set = function (moduleName) {
    return System.registry.set(moduleName);
  };
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