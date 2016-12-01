/**
 * Copyright 2016 Alexis Vincent (http://alexisvincent.io)
 */
// import ajv from 'ajv'

// Make sure SystemJS has loaded
if (!window.System && !!window.SystemJS)
    console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded')

// Bind and shadow the reference we will be using
const System = window.SystemJS

// Make sure System.trace is set (needed for System.defined to be fully populated)
if (!System.trace)
    console.warn('System.trace needs to be set for reloading to function')

// Maintain a reference to all properties of the unpatched SystemJS object
// Whenever using _System, bind in the System object. So for example
// _System.normalize.apply(System, ["someModule"])
const _System = {
    __proto__: {
        __proto__: {
            ...System.__proto__.__proto__
        },
        ...System.__proto__,
    },
    ...System
}

// Stores state systemjs-hmr needs access to
const reloader = System.reloader = {
    // promise lock so that only one reload process can happen at a time
    lock: Promise.resolve(true),

    // Maps normalized module names to their previous instance
    registry: new Map(),

    // **Experimental** Construct a per module persistent object
    _persistentRegistry: {},
    _getState: (name) => {
        if (!reloader._persistentRegistry[name])
            reloader._persistentRegistry[name] = {}

        return reloader._persistentRegistry[name]
    }
}


/**
 * Override standard normalize function to map calls to @hot to normalizedCallerModuleName!@@hot
 * @param moduleName
 * @param parentName
 * @param parentAddress
 * @returns {*}
 */
System.__proto__.normalize = function (moduleName, parentName, parentAddress) {
    if (moduleName == '@hot')
        return Promise.resolve(parentName + '!@@hot')
    else return _System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress])
}

/**
 * Override standard normalize function to map calls to @hot to normalizedCallerModuleName!@@hot
 * @param moduleName
 * @param parentName
 * @param parentAddress
 * @returns {*}
 */
System.__proto__.normalizeSync = function (moduleName, parentName, parentAddress) {
    if (moduleName == '@hot')
        return parentName + '!@@hot'
    else return _System.__proto__.normalizeSync.apply(System, [moduleName, parentName, parentAddress])
}

/**
 * Store a reference to the loader used to resolve imports of '@hot'
 */
System.set('@@hot', System.newModule({
    locate: function (loads) {
        return loads.name
    },
    fetch: function () {
        return ""
    },
    instantiate: function ({address}) {
        return {
            // Get previous instance of module
            module: reloader.registry.get(address) || false,
            // **Experimental** Get persistent state object
            _state: reloader._getState(address)
        }
    }
}))


/**
 * Return normalized names of all modules that import this module
 * @param moduleName
 * @returns {Array}
 */
const findDirectDependants = (moduleName) => {
    return Object.keys(System.defined)
        .filter((key) => (System.defined[key].normalizedDeps || []).find(name => name == moduleName))
}


/**
 * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
 * as well as the root dependencies
 * @param moduleName
 * @returns {{dependants: Array, roots: Array}}
 */
const findDependants = (moduleName) => {

    // A queue of modules to explore next, starting with moduleName
    const next = []

    if (System.defined[moduleName]) next.push(moduleName)

    // A Set of all modules that depend on this one (includes moduleName)
    const dependents = new Set()

    // A Set of all modules that look like roots
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
        // Array of normalized modules that depend on moduleName
        dependants: Array.from(dependents),
        // A guess at which modules are roots (can't accurately determine roots if circular references include them)
        roots: Array.from(roots)
    }
}

/**
 * System.reload
 * Discover all modules that depend on moduleName, delete them, then re-import the roots.
 *
 */
const reload = System.reload = (moduleName, meta = {}) => {

    // Validate params
    if (typeof meta != 'object')
        throw new Error("When calling System.reload(_, meta), meta should be an object")

    if (!Array.isArray(meta.roots)) {
        if (meta.roots == undefined) meta.roots = false
        else throw new Error("When calling System.reload(_, meta), meta.roots should me an array of normalized module names")
    }

    /**
     * Allow people to pass in a set of modules to load after deleting dependants and before importing the roots.
     * For now this is mocked with an empty array.
     * @type {Array}
     */
    meta.preload = []


    return reloader.lock = reloader.lock.then(() => {
        return _System.normalize.apply(System, [moduleName])
            .then(name => findDependants(name))
            .then(({dependants, roots}) => {
                // Delete all dependent modules

                if (roots.length == 0 && meta.roots.length == 0)
                    console.warn(
                        `systemjs-hmr: We couldn't detect any roots (entry points), this usually`,
                        `means you have a circular dependency in your app code. This isn't a problem,`,
                        `it just means that you need to specify {roots: [ ...roots ]} as the second argument`,
                        `to System.reload. You can read more here: https://github.com/alexisvincent/systemjs-hmr#reload-api.`,
                        `This is typically a library level concern, so if you are using a library that provides hot module replacement,`,
                        `check how they handle entry points, or if they don't, open an issue with the library.`
                    )


                return Promise.all(dependants.map(dependent => {

                    // Get reference to module definition so that we can determine dependencies
                    const dep = System.defined[dependent]

                    /**
                     * If the module imports @hot, save a reference to it (to save space in the registry).
                     * The only time this is problematic is if someone adds an import to @hot. Then on the first reload,
                     * we won't have a reference to the old module. But on all subsequent reloads we will. Not an issue
                     * since the person will be in the process of adding reload support to a module and will be thinking
                     * about this case.
                     */
                    if (dep.deps.find(name => name == '@hot'))
                        reloader.registry.set(dependent, System.get(dependent))

                    return Promise.all([
                        // Delete the module from the registry
                        System.delete(dependent),
                        // And the module provided by the loader (So that a new module can be created upon reload)
                        System.delete(dependent + '!@@hot')
                    ])
                }))
                    .then(() => {
                        Promise.all(meta.preload.map(({
                            name,
                            source
                        }) => System.load(name)))
                    })

                    .then(() =>
                        // If roots have been specified in meta, load those, otherwise load our best guess
                        (meta.roots ? meta.roots : roots)
                            .map(System.normalizeSync)
                            .map(root => System.load(root)))
                // .then(() => {
                //     reloader.loadCache.clear()
                // })
            })
    }).catch((err) => console.log(err))
}
