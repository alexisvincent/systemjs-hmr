'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Copyright 2016 Alexis Vincent (http://alexisvincent.io)
 */
// import ajv from 'ajv'

// Make sure SystemJS has loaded
if (!window.System && !!window.SystemJS) console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded');

// Bind and shadow the reference we will be using
var System = window.SystemJS;

// Make sure System.trace is set (needed for System.defined to be fully populated)
if (!System.trace) console.warn('System.trace needs to be set for reloading to function');

// Maintain a reference to all properties of the unpatched SystemJS object
// Whenever using _System, bind in the System object. So for example
// _System.normalize.apply(System, ["someModule"])
var _System = _extends({
  __proto__: _extends({
    __proto__: _extends({}, System.__proto__.__proto__)
  }, System.__proto__)
}, System);

// Stores state systemjs-hmr needs access to
var reloader = System.reloader = {
  // promise lock so that only one reload process can happen at a time
  lock: Promise.resolve(true),

  // **Experimental** Construct a per module persistent object
  _persistentRegistry: {},
  _getState: function _getState(name) {
    if (!reloader._persistentRegistry[name]) reloader._persistentRegistry[name] = {};

    return reloader._persistentRegistry[name];
  }
};

var getHotName = function getHotName(moduleName) {
  return moduleName + '@hot';
};

var createHotModule = function createHotModule(moduleName) {
  if (!System.has(getHotName(moduleName))) {
    return System.newModule({
      // Get previous instance of module
      module: false,
      // **Experimental** Get persistent state object
      _state: reloader._getState(moduleName)
    });
  } else {
    return System.newModule({
      module: System.get(moduleName),
      // **Experimental** Get persistent state object
      _state: reloader._getState(moduleName)
    });
  }
};

var normalizeHot = function normalizeHot(parentName) {
  var hotName = getHotName(parentName);

  // No hotmodule exists, make and set one
  if (!System.has(hotName)) System.set(hotName, createHotModule(parentName));

  return hotName;
};

/**
 * Override standard normalize function to map calls to @hot to normalizedCallerModuleName!@@hot
 * This needs to be idempotent
 * @param moduleName
 * @param parentName
 * @param parentAddress
 * @returns {*}
 */
System.__proto__.normalize = function (moduleName, parentName, parentAddress) {
  // console.log('normalize', moduleName, parentName, parentAddress)
  if (moduleName == '@hot') return Promise.resolve(normalizeHot(parentName));else return _System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress]);
};

/**
 * Override standard normalize function to map calls to @hot to normalizedCallerModuleName!@@hot
 * This needs to be idempotent
 * @param moduleName
 * @param parentName
 * @param parentAddress
 * @returns {*}
 */
System.__proto__.normalizeSync = function (moduleName, parentName, parentAddress) {
  if (moduleName == '@hot') return normalizeHot(parentName);else return _System.__proto__.normalizeSync.apply(System, [moduleName, parentName, parentAddress]);
};

/**
 * Return normalized names of all modules that import this module
 * @param moduleName
 * @returns {Array}
 */
var findDirectDependants = function findDirectDependants(moduleName) {
  return Object.keys(System.defined).filter(function (key) {
    return (System.defined[key].normalizedDeps || []).find(function (name) {
      return name == moduleName;
    });
  });
};

/**
 * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
 * as well as the root dependencies
 * @param moduleName
 * @returns {{dependants: Array, roots: Array}}
 */
var findDependants = function findDependants(moduleName) {

  // A queue of modules to explore next, starting with moduleName
  var next = [];

  if (System.defined[moduleName]) next.push(moduleName);

  // A Set of all modules that depend on this one (includes moduleName)
  var dependents = new Set();

  // A Set of all modules that look like roots
  var roots = new Set();

  // While there are modules to explore (we might have already traversed some of them)
  while (next.length > 0) {

    // Get the first module to explore
    var dep = next.pop();

    // If we haven't already explored it
    if (!dependents.has(dep)) {
      // Add it to the list of explored modules
      dependents.add(dep);

      // Get a list of the modules that import it
      var directDependants = findDirectDependants(dep);

      // Add those to the list of modules to explore
      next.push.apply(next, _toConsumableArray(directDependants));

      // Does this module look like a root
      if (directDependants.length == 0) roots.add(dep);
    }
  }

  return {
    // Array of normalized modules that depend on moduleName
    dependants: Array.from(dependents),
    // A guess at which modules are roots (can't accurately determine roots if circular references include them)
    roots: Array.from(roots)
  };
};

/**
 * System.reload
 * Discover all modules that depend on moduleName, delete them, then re-import the roots.
 *
 */
System.reload = function (moduleName) {
  var meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  // Validate params
  if ((typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) != 'object') throw new Error("When calling System.reload(_, meta), meta should be an object");

  if (!Array.isArray(meta.roots)) {
    if (meta.roots == undefined) meta.roots = false;else throw new Error("When calling System.reload(_, meta), meta.roots should me an array of normalized module names");
  }

  /**
   * Allow people to pass in a set of modules to load after deleting dependants and before importing the roots.
   * For now this is mocked with an empty array.
   * @type {Array}
   */
  meta.preload = [];

  return reloader.lock = reloader.lock.then(function () {
    return _System.normalize.apply(System, [moduleName]).then(function (name) {
      return findDependants(name);
    }).then(function (_ref) {
      var dependants = _ref.dependants,
          roots = _ref.roots;

      // Delete all dependent modules

      // console.log('roots', roots)

      if (roots.length == 0 && meta.roots.length == 0) console.warn('systemjs-hmr: We couldn\'t detect any roots (entry points), this usually', 'means you have a circular dependency in your app code. This isn\'t a problem,', 'it just means that you need to specify {roots: [ ...roots ]} as the second argument', 'to System.reload. You can read more here: https://github.com/alexisvincent/systemjs-hmr#reload-api.', 'This is typically a library level concern, so if you are using a library that provides hot module replacement,', 'check how they handle entry points, or if they don\'t, open an issue with the library.');

      return Promise.all(dependants.map(function (dependent) {

        // Get reference to module definition so that we can determine dependencies
        var dep = System.defined[dependent];

        /**
         * If the module imports @hot, save a reference to it (to save space in the registry).
         * The only time this is problematic is if someone adds an import to @hot. Then on the first reload,
         * we won't have a reference to the old module. But on all subsequent reloads we will. Not an issue
         * since the person will be in the process of adding reload support to a module and will be thinking
         * about this case.
         */
        if (dep.deps.find(function (name) {
          return name == '@hot';
        })) System.set(getHotName(dependent), createHotModule(dependent));

        // Delete the module from the registry
        return System.delete(dependent);
      }))
      // .then(() => {
      //   return Promise.all(meta.preload.map(({
      //     name,
      //     source
      //   }) => System.load(name)))
      // })

      .then(function () {
        // If roots have been specified in meta, load those, otherwise load our best guess
        return (meta.roots ? meta.roots : roots).map(System.normalizeSync).map(function (root) {
          return System.load(root);
        });
        // .then(() => {
        //     reloader.loadCache.clear()
        // })
      });
    });
  }).catch(function (err) {
    return console.log(err);
  });
};