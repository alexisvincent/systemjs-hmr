/**
 * Copyright 2016 Alexis Vincent (http://alexisvincent.io)
 */
// import ajv from 'ajv'
import d from 'debug'

// Make sure SystemJS has loaded
if (!window.System && !!window.SystemJS)
  console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded')

// Bind and shadow the reference we will be using
const System = window.SystemJS

if (!System._reloader) {
  // Make sure System.trace is set (needed for System.defined to be fully populated)
  System.trace = true

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
  const reloader = System._reloader = {
    // promise lock so that only one reload process can happen at a time
    lock: Promise.resolve(true),

    // **Experimental** Construct a per module persistent object
    _persistentRegistry: {},
    _getState: (name) => {
      if (!reloader._persistentRegistry[name])
        reloader._persistentRegistry[name] = {}

      return reloader._persistentRegistry[name]
    }
  }

  // Given the importers module name, returns the name used to store its '@hot' previous instance module
  const getHotName = moduleName => moduleName + '@hot'

  const createHotModule = moduleName => {
    d('systemjs-hmr:createHotModule')(moduleName)

    if (!System.has(getHotName(moduleName))) {
      return System.newModule({
        // Get previous instance of module
        module: false,
        // **Experimental** Get persistent state object
        _state: reloader._getState(moduleName)
      })
    } else {
      return System.newModule({
        module: System.get(moduleName),
        // **Experimental** Get persistent state object
        _state: reloader._getState(moduleName)
      })
    }
  }

  /**
   * Used in System.normalize and System.normalizeSync to normalize @hot to its module
   * and create a hot module if none exists.
   * @param parentName
   */
  const normalizeHot = (parentName) => {
    const hotName = getHotName(parentName)

    // No hotmodule exists, make and set one
    if (!System.has(hotName)) System.set(hotName, createHotModule(parentName))

    d('systemjs-hmr:normalize')(parentName, '->', hotName)
    return hotName
  }


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
    if (moduleName == '@hot') return Promise.resolve(normalizeHot(parentName))
    else return _System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress])
  }

  /**
   * Override standard normalize function to map calls to @hot to normalizedCallerModuleName!@@hot
   * This needs to be idempotent
   * @param moduleName
   * @param parentName
   * @param parentAddress
   * @returns {*}
   */
  System.__proto__.normalizeSync = function (moduleName, parentName, parentAddress) {
    if (moduleName == '@hot') return normalizeHot(parentName)
    else return _System.__proto__.normalizeSync.apply(System, [moduleName, parentName, parentAddress])
  }

  // Return normalized names of all modules that import this module
  const findDirectDependants = (moduleName) => {
    return Object.keys(System.defined)
      .filter((key) => (System.defined[key].normalizedDeps || []).find(name => name == moduleName))
  }

  /**
   * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
   * as well as the root dependencies
   * @param moduleName
   * @returns {{dependants: Array, entries: Array}}
   */
  const findDependants = (moduleName) => {

    // A queue of modules to explore next, starting with moduleName
    const next = []

    if (System.defined[moduleName]) next.push(moduleName)

    // A Set of all modules that depend on this one (includes moduleName)
    const dependents = new Set()

    // A Set of all modules that look like entries
    const entries = new Set()

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

        // Does this module look like a app entry
        if (directDependants.length == 0)
          entries.add(dep)
      }
    }

    return {
      // Array of normalized modules that depend on moduleName
      dependants: Array.from(dependents),
      // A guess at which modules are entries (can't accurately determine entries if circular references include them)
      entries: Array.from(entries)
    }
  }

  /**
   * System.reload
   * Discover all modules that depend on moduleName, delete them, then re-import the app entries.
   *
   */
  System.reload = (moduleName, meta = {}) => {

    const debug = d('systemjs-hmr:reload')

    debug('reloading', moduleName, 'with options', meta)

    // Validate params
    if (typeof meta != 'object')
      throw new Error("When calling System.reload(_, meta), meta should be an object")

    if (!Array.isArray(meta.entries)) {
      if (meta.entries == undefined) meta.entries = false
      else throw new Error("When calling System.reload(_, meta), meta.entries should me an array of normalized module names")
    }

    /**
     * Allow people to pass in a set of modules to load after deleting dependants and before importing the entries.
     * For now this is mocked with an empty array.
     * @type {Array}
     */
    meta.preload = []

    return reloader.lock = reloader.lock.then(() => {
      debug('queued reload starting')
      return _System.normalize.apply(System, [moduleName])
        .then(name => findDependants(name))
        .then(({dependants, entries}) => {
          debug('found dependents', dependants, 'with entries', entries)
          // Delete all dependent modules

          if (entries.length == 0 && meta.entries.length == 0)
            console.warn(
              `systemjs-hmr: We couldn't detect any entries (entry points), this usually`,
              `means you have a circular dependency in your app code. This isn't a problem,`,
              `it just means that you need to specify {entries: [ ...entries ]} as the second argument`,
              `to System.reload. You can read more here: https://github.com/alexisvincent/systemjs-hmr#reload-api.`,
              `This is typically a library level concern, so if you are using a library that provides hot module replacement,`,
              `check how they handle entry points, or if they don't, open an issue with the library.`
            )

          debug('deleting dependents')
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
            if (dep.deps.find(name => name == '@hot')) {
              debug(dependent, 'imports @hot')
              System.set(getHotName(dependent), createHotModule(dependent))
            }

            debug('deleting', dependent)
            // Delete the module from the registry
            return System.delete(dependent)
          }))
          // .then(() => {
          //   return Promise.all(meta.preload.map(({
          //     name,
          //     source
          //   }) => System.load(name)))
          // })

            .then(() => {
              debug('all dependents deleted, loading entries')
              // If entries have been specified in meta, load those, otherwise load our best guess
              return (meta.entries ? meta.entries : entries)
                .map(System.normalizeSync)
                .map(entry => System.import(entry)
                  .catch(err => console.error(err)))
              // .then(() => {
              //     reloader.loadCache.clear()
              // })
            })
        })
    }).catch((err) => console.log(err))
  }
}
