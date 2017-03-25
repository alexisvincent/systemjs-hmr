// import ajv from 'ajv'
import d from 'debug'
import Promise from 'bluebird'
// import type from '@type/systemjs'
// import {Graph}  from 'imgraphjs'
import { Set } from 'immutable'

declare const SystemJS: SystemJSLoader.System;

const log = d('systemjs-hmr:log')

// Make sure SystemJS has loaded
if (!SystemJS)
    console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded')

const version = SystemJS.version.split(' ')[0].split('.')[1]

const
    is19 = version == '19',
    is20 = version == '20';

if (!SystemJS._reloader) {

    if (!(is19 || is20))
        console.warn(
            'Only support for SystemJS 0.19 and 0.20 has been tested. You are using', SystemJS.version,
            '. If you are having success with this version, please let us know so we can add it to the list of known working versions'
        )

    // Make sure System.trace is set (needed for trace to be fully populated)
    SystemJS.trace = true

    if (is20)
        SystemJS.loads = SystemJS.loads || {}

    const trace = {
        _: is20 ? SystemJS.loads : SystemJS.defined,
        get: (moduleID) => trace._[moduleID],
        keys: () => Object.keys(trace._),
        values: () => Object.values(trace._),
        has: (moduleID) => !!trace.get(moduleID),

        // return normalized names of all modules moduleId imports
        getDependencies: (moduleId) => {
            const traceEntry = trace.get(moduleId)

            if (!traceEntry) return []
            else if (is20) return Object.values(traceEntry.depMap)
            else if (is19 || true) return traceEntry.normalizedDeps || []
        },

        // does moduleID import normalizedDep
        hasDependency: (moduleID, normalizedDep) => trace.getDependencies(moduleID).some(name => name == normalizedDep),

        // return normalized names of all modules that import this moduleName
        getDependents: (moduleName) => trace.keys().filter(dep => trace.hasDependency(dep, moduleName))
    }

    // Stores state systemjs-hmr needs access to
    const _ = SystemJS._reloader = {
        // promise lock so that only one reload process can happen at a time
        lock: Promise.resolve(true),

        trace,

        entryCache: [],
        lastImportFailed: false,

        // **Experimental** Construct a per module persistent object
        _persistentRegistry: {},
        _getState: (name) => {
            if (!_._persistentRegistry[name])
                _._persistentRegistry[name] = {}

            return _._persistentRegistry[name]
        }
    }

    // Given the importers module name, returns the name used to store its '@hot' previous instance module
    const getHotName = moduleName => moduleName + '@hot'

    const getHotModule = (moduleName) => {
        d('systemjs-hmr:createHotModule')(moduleName)

        return SystemJS.newModule({
            // Get previous instance of module or false
            module: SystemJS.has(getHotName(moduleName)) ? SystemJS.get(moduleName) : false,
            // **Experimental** Get persistent state object
            _state: _._getState(moduleName)
        })
    }

    /**
     * Used in System.normalize and System.normalizeSync to normalize @hot to its module
     * and create a hot module if none exists.
     * @param parentName
     */
    const resolveHotModule = (parentName) => {
        const hotName = `${parentName}@hot`

        // No hotmodule exists, make and set one
        if (!SystemJS.has(hotName)) SystemJS.set(hotName, getHotModule(parentName))

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
    if (is20) {
        SystemJS.resolve = function(moduleName, parentName, parentAddress) {
            if (moduleName == '@hot') return Promise.resolve(resolveHotModule(parentName))
            else return SystemJS.__proto__.resolve.apply(SystemJS, [moduleName, parentName, parentAddress])
        }.bind(SystemJS)

    } else {
        SystemJS.normalize = function(moduleName, parentName, parentAddress) {
            if (moduleName == '@hot') return Promise.resolve(resolveHotModule(parentName))
            else return SystemJS.__proto__.normalize.apply(SystemJS, [moduleName, parentName, parentAddress])
        }.bind(SystemJS)
    }

    const resolve = is20 ? SystemJS.resolve : SystemJS.normalize

    // const rebuildGraph = () => {
    //   let graph = Graph()
    //
    //   trace.keys().forEach(moduleID => {
    //     // graph = graph.mergeNode(moduleID, {})
    //     trace.getDependencies(moduleID).forEach(dep => {
    //       graph = graph.mergeEdge(`${moduleID}.depends-on.${dep}`, {}, 'depends-on', moduleID, dep)
    //     })
    //   })
    //
    //   return graph
    // }


    const findEntries = () => {
        let entries = Set()
        let modulesToExplore = Set.of(...trace.keys())

        while (modulesToExplore.size > 0) {
            // pick a node and add it to entries
            const node = modulesToExplore.first()
            modulesToExplore = modulesToExplore.remove(node)
            entries = entries.add(node)

            const removeDepsOf = (dep) => {
                modulesToExplore = modulesToExplore.remove(dep)

                if (trace.has(dep))
                    trace.getDependencies(dep).forEach(depToRemove => {
                        if (entries.has(depToRemove)) entries = entries.remove(depToRemove)
                        else if (modulesToExplore.has(depToRemove)) removeDepsOf(depToRemove)
                    })
            }

            removeDepsOf(node)
        }

        return entries.toJS().filter(entry => !entry.includes('jspm_packages'))
    }

    /**
     * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
     * as well as the root dependencies
     * @param moduleName
     * @param entries
     * @returns {{dependants: Array, entries: Array}}
     */
    const findDependants = (moduleName, entries) => {

        // A queue of modules to explore next, starting with moduleName
        const next = []

        // If the module exists in the trace, use it as starting point for discovery
        if (trace.has(moduleName))
            next.push(moduleName)

        // A Set of all modules that depend on this one (includes moduleName)
        let dependents = Set()

        // While there are modules to explore (we might have already traversed some of them)
        while (next.length > 0) {

            // Get the first module to explore
            const dep = next.pop()

            // If we haven't already explored it
            if (!dependents.has(dep)) {
                // Add it to the list of explored modules
                dependents = dependents.add(dep)

                // Get a list of the modules that import it
                const directDependants = trace.getDependents(dep)

                // Add those to the list of modules to explore
                next.push(...directDependants)
            }
        }

        return {
            // Array of normalized modules that depend on moduleName
            dependants: Array.from(dependents.toJS()),
            // A guess at which modules are entries (can't accurately determine entries if circular references include them)
            entries: entries.length > 0 ? entries : findEntries()
        }
    }

    /**
     * Unload the module from the browser and delete from registry
     * @param moduleName
     */
    SystemJS.unload = (moduleName) => {
        const debug = d('systemjs-hmr:reload')
        debug('unloading', moduleName)

        if (SystemJS.has(moduleName)) {
            const module = SystemJS.get(moduleName)

            if (typeof module.__unload == 'function')
                module.__unload()
        }

        SystemJS.delete(moduleName)
    }

    /**
     * System.reload
     * Discover all modules that depend on moduleName, delete them, then re-import the app entries.
     */
    SystemJS.reload = (moduleName, options: any = {}) => {

        options = Object.assign({}, options)

        const debug = d('systemjs-hmr:reload')

        debug('reloading', moduleName, 'with options', options)
        log('reloading', moduleName)

        // Validate params
        if (typeof options != 'object')
            throw new Error("When calling System.reload(_, meta), meta should be an object")

        if (!Array.isArray(options.entries)) {
            if (options.entries == undefined) options.entries = false
            else throw new Error("When calling System.reload(_, meta), meta.entries should me an array of normalized module names")
        }

        /**
         * Allow people to pass in a set of modules to load after deleting dependants and before importing the entries.
         * For now this is mocked with an empty array.
         * @type {Array}
         */
        options.preload = []

        return _.lock = _.lock.then(() => {
            debug('queued reload starting')
            return resolve(moduleName)

                .then(name => findDependants(name, _.lastImportFailed ? _.entryCache : options.entries))
                .then(({ dependants, entries }) => {
                    debug('found dependents', dependants, 'with entries', entries)
                    // Delete all dependent modules

                    if (entries.length == 0 && options.entries.length == 0)
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

                        /**
                         * Persist the old module instance if
                         * 1. It imports '@hot'
                         * 2. It exports a __reload function (backwards comparability)
                         *
                         * The only time this is problematic is if someone adds an import to @hot (or exports __reload).
                         * Then on the first reload, we won't have a reference to the old module. But on all subsequent
                         * reloads we will. Not an issue since the person will be in the process of adding reload support
                         * to a module and will be thinking about this case.
                         */
                        return resolve(dependent)
                            .then(dependent => {
                                const module = SystemJS.get(dependent)
                                if (
                                    trace.hasDependency(dependent, resolveHotModule(dependent)) ||
                                    (module && typeof module.__reload == 'function')
                                ) {
                                    debug(dependent, 'imports @hot')
                                    if (!(SystemJS.has(getHotName(dependent)) && !SystemJS.has(dependent)))
                                        SystemJS.set(getHotName(dependent), getHotModule(dependent))
                                }

                                // Unload the module from the browser and delete from registry
                                return SystemJS.unload(dependent)
                            })
                    }))
                        .then(() => {
                            log('dependency tree purged, reimporting entries', entries)
                            _.lastImportFailed = false
                            return Promise.resolve(entries)
                                // resolve all entries
                                .map(x => resolve(x))
                                // import all entries, complain if there was an error, but continue anyway
                                .map(entry => SystemJS.import(entry).catch(err => {
                                    _.lastImportFailed = true
                                    console.error(err.originalErr || err)
                                }))
                                // Print any errors
                                .catch((e) => console.error(e))
                        }).then(() => {
                            // Support for the old way of reloading deps

                            let usedReload = false

                            dependants.forEach((dependent) => {
                                const module = SystemJS.get(dependent)

                                if (module && typeof module.__reload == 'function') {
                                    usedReload = true
                                    module.__reload(SystemJS.get(getHotName(dependent)).module)
                                }
                            })

                            if (usedReload && SystemJS.warnings)
                                console.warn(
                                    'Exporting __reload to reload your module is deprecated, upgrade docs here:',
                                    'https://github.com/alexisvincent/systemjs-hmr'
                                )
                        })
                })
        }).catch((err) => console.log(err))
    }
}
