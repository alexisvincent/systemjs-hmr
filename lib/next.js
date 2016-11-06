/**
 * Copyright 2016 Alexis Vincent (http://alexisvincent.io)
 */

// Make sure SystemJS has loaded
if (!window.System && !!window.SystemJS)
    console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded')

// Bind and shadow the reference we will be using
const System = window.SystemJS

// Make sure System.trace is set (needed for System.defined to be fully populated)
if (!System.trace)
    console.warn('System.trace needs to be set for reloading to function')

// Maintain a reference to all properties of the unpatched SystemJS object
const _System = {...System}

_System.__proto__ = {...System.__proto__}

// Attach the reloader object (systemjs-hmr state, dependency trees, cache, etc)
const reloader = System.reloader = {
    registry: new Map(),
    _persistantRegistry: {},
    _getState: (name) => {
        if (!reloader._persistantRegistry[name])
            reloader._persistantRegistry[name] = {}

        return reloader._persistantRegistry[name]
    }
}


/**
 * Return normalized names of all modules that import this module
 * @param moduleName
 * @returns {Array}
 */
const findDirectDependants = (moduleName) => {
    return Object.values(System.defined)
        .filter(({normalizedDeps}) => normalizedDeps.find(name => name == moduleName))
        .map(({name}) => name)
}


/**
 * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
 * as well as the root dependencies
 * @param moduleName
 * @returns {{dependants: Array, roots: Array}}
 */
const findDependants = (moduleName) => {

    // A queue of modules to explore next, starting with moduleName
    const next = [moduleName]

    // A Set of all modules that depend on this one (includes moduleName)
    const dependents = new Set()

    // A Set of all modules that depend on this one and that don't
    const roots = new Set()

    // While there are modules to explore (we might have already traversed some of them)
    while (next.length > 0) {

        // Get the first module to explore
        const dep = next.pop()

        // If we haven't already explored it
        if (!dependents.has(dep)) {
            // Add it to the list of explored modules
            dependents.add(dep)

            // Get a list of the modules that import it
            const directDependants = findDirectDependants(dep)

            // Add those to the list of modules to explore
            next.push(...directDependants)

            // Does this module look like a root
            if (directDependants.length == 0)
                roots.add(dep)
        }
    }

    return {
        dependants: Array.from(dependents),
        roots: Array.from(roots)
    }
}

const reload = System.reload = (moduleName, meta = {}) => {

    if (typeof meta != 'object')
        throw new Error("When calling System.reload(_, meta), meta should be an object")

    if (!Array.isArray(meta.roots)) {
        if (meta.roots == undefined) meta.roots = false
        else throw new Error("When calling System.reload(_, meta), meta.roots should me an array of normalized module names")
    }

    _System.normalize(moduleName)
        .then(name => findDependants(name))
        .then(({dependants, roots}) => {
            Promise.all(dependants.map(dependant => {

                const dep = System.defined[dependant]

                // If the module imports @hot, save a reference to it
                if (dep.deps.find(name => name == '@hot'))
                    reloader.registry.set(dependant, System.get(dependant))

                return Promise.all([
                    System.delete(dependant),
                    System.delete(dependant + '!@@hot')
                ])
            })).then(() =>
                (meta.roots ? meta.roots : roots)
                    .map(root => System.load(root)))
        })
}

System.__proto__.normalize = function (moduleName, parentName, parentAddress) {
    if (moduleName == '@hot')
        return Promise.resolve(parentName + '!@@hot')
    else return _System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress])
}

System.__proto__.normalizeSync = function (moduleName, parentName, parentAddress) {
    if (moduleName == '@hot')
        return parentName + '!@@hot'
    else return _System.__proto__.normalizeSync.apply(System, [moduleName, parentName, parentAddress])
}

System.set('@@hot', System.newModule({
    locate: function (loads) {
        return loads.name
    },
    fetch: function () {
        return ""
    },
    instantiate: function ({address}) {
        return {
            module: reloader.registry.get(address) || false,
            _state: reloader._getState(address)
        }
    }
}))
