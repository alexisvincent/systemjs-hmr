'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Copyright 2016 Alexis Vincent (http://alexisvincent.io)
 */

// Make sure SystemJS has loaded
if (!window.System && !!window.SystemJS) console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded');

// Bind and shadow the reference we will be using
var System = window.SystemJS;

// Make sure System.trace is set (needed for System.defined to be fully populated)
if (!System.trace) console.warn('System.trace needs to be set for reloading to function');

// Maintain a reference to all properties of the unpatched SystemJS object
var _System = _extends({}, System);

_System.__proto__ = _extends({}, System.__proto__);

// Attach the reloader object (systemjs-hmr state, dependency trees, cache, etc)
var reloader = System.reloader = {
    registry: new Map()
};

/**
 * Return normalized names of all modules that import this module
 * @param moduleName
 * @returns {Array}
 */
var findDirectDependants = function findDirectDependants(moduleName) {
    return Object.values(System.defined).filter(function (_ref) {
        var normalizedDeps = _ref.normalizedDeps;
        return normalizedDeps.find(function (name) {
            return name == moduleName;
        });
    }).map(function (_ref2) {
        var name = _ref2.name;
        return name;
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
    var next = [moduleName];

    // A Set of all modules that depend on this one (includes moduleName)
    var dependents = new Set();

    // A Set of all modules that depend on this one and that don't
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
        dependants: Array.from(dependents),
        roots: Array.from(roots)
    };
};

var reload = System.reload = function (moduleName) {
    var meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    if ((typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) != 'object') throw new Error("When calling System.reload(_, meta), meta should be an object");

    if (!Array.isArray(meta.roots)) {
        if (meta.roots == undefined) meta.roots = false;else throw new Error("When calling System.reload(_, meta), meta.roots should me an array of normalized module names");
    }

    _System.normalize(moduleName).then(function (name) {
        return findDependants(name);
    }).then(function (_ref3) {
        var dependants = _ref3.dependants,
            roots = _ref3.roots;

        Promise.all(dependants.map(function (dependant) {

            var dep = System.defined[dependant];

            // If the module imports @hot, save a reference to it
            if (dep.deps.find(function (name) {
                return name == '@hot';
            })) reloader.registry.set(dependant, System.get(dependant));

            return Promise.all([System.delete(dependant), System.delete(dependant + '!@@hot')]);
        })).then(function () {
            return (meta.roots ? meta.roots : roots).map(function (root) {
                return System.load(root);
            });
        });
    });
};

System.__proto__.normalize = function (moduleName, parentName, parentAddress) {
    if (moduleName == '@hot') return Promise.resolve(parentName + '!@@hot');else return _System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress]);
};

System.__proto__.normalizeSync = function (moduleName, parentName, parentAddress) {
    if (moduleName == '@hot') return parentName + '!@@hot';else return _System.__proto__.normalizeSync.apply(System, [moduleName, parentName, parentAddress]);
};

System.set('@@hot', System.newModule({
    locate: function locate(loads) {
        return loads.name;
    },
    fetch: function fetch() {
        return "";
    },
    instantiate: function instantiate(_ref4) {
        var address = _ref4.address;

        return {
            module: reloader.registry.get(address) || false
        };
    }
}));