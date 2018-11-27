import { Set } from 'immutable'
import { curryN } from 'ramda'
import Promise from 'bluebird'

type VersionInfo = {
    major: number,
    minor: number,
    patch: number,
    full: string,
    tag: string,
    is19: boolean,
    isAtleast20: boolean   
}

export const getVersionInfo = (System: SystemJSLoader.System): VersionInfo => {
    const [full, tag] = System.version.split(' ')
    const [major, minor, patch] = full.split('.').map(parseInt)

    const
        is19 = minor == 19,
        isAtleast20 = minor >= 20;        

    return { full, tag, major, minor, patch, isAtleast20, is19 }
}


export type TraceEntry = {
    depMap: string[],
    normalizedDeps: string[]
}

export type Trace = {
    get: (moduleID: string) => TraceEntry | false,
    keys: () => string[],
    values: () => TraceEntry[],
    has: (moduleID: string) => boolean
}

type Logger = (message: string, scope?: string) => void

export type Context = {
    System: SystemJSLoader.System,
    version: VersionInfo,
    trace: Trace,
    lock: Promise<string>,
    logger: Logger,
    entryCache: string[],
    lastImportFailed: boolean,
    resolve: (moduleID: string, parentID?: string) => Promise<string>
}

export const makeContext = (System: SystemJSLoader.System, logger: Logger): Context => {
    const version = getVersionInfo(System)
    const { isAtleast20 } = version

    // Make sure System.trace is set (needed for trace to be fully populated)
    System.trace = true

    if (isAtleast20) System.loads = SystemJS.loads || {}

    const traceIMPL = isAtleast20 ? SystemJS.loads : SystemJS.defined

    const trace: Trace = {
        get: (moduleID) => traceIMPL[moduleID] || false,
        keys: () => Object.keys(traceIMPL),
        values: () => Object.values(traceIMPL),
        has: (moduleID) => !!trace.get(moduleID)
    }

    const context = {
        System, version, trace, logger,

        // promise lock so that only one reload process can happen at a time
        lock: Promise.resolve(''),

        entryCache: [],
        lastImportFailed: false,

        resolve: isAtleast20 ? SystemJS.resolve : SystemJS.normalize
    }

    /**
     * Override standard normalize function to map calls to @hot to normalizedCallerModuleName!@@hot
     * This needs to be idempotent
     * @param moduleName
     * @param parentName
     * @param parentAddress
     * @returns {*}
     */
    if (isAtleast20) {
        System.resolve = function(moduleName, parentName, parentAddress) {
            if (moduleName == '@hot') return Promise.resolve(resolveHotModule(context, parentName))
            else return SystemJS.__proto__.resolve.apply(System, [moduleName, parentName, parentAddress])
        }.bind(System)

    } else {
        System.normalize = function(moduleName, parentName, parentAddress) {
            if (moduleName == '@hot') return Promise.resolve(resolveHotModule(context, parentName))
            else return System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress])
        }.bind(System)
    }

    return context
}

// Given the importers module name, returns the name used to store its '@hot' previous instance module
export const getHotName = (moduleName: String) => moduleName + '@hot'


// return normalized names of all modules moduleId imports
export const getDependencies = ({ version: { minor }, trace }: Context, moduleId: string) => {
    const traceEntry = trace.get(moduleId)

    if (!traceEntry) return []
    else switch (minor) {
        case 20: return Object.values(traceEntry.depMap)
        default: return traceEntry.normalizedDeps || []
    }
}

// does moduleID import normalizedDep
export const hasDependency = (context: Context, moduleID: string, normalizedDep: string) => {
    return getDependencies(context, moduleID)
        .some(name => name == normalizedDep)
}

// return normalized names of all modules that import this moduleName
export const getDependents = (context: Context, moduleName: string) => {
    return context.trace.keys()
        .filter(dep => hasDependency(context, dep, moduleName))
}


export const findEntries = (context: Context) => {
    const { trace } = context
    let entries = Set() as Set<string>
    let modulesToExplore = Set.of(...trace.keys())

    while (modulesToExplore.size > 0) {
        // pick a node and add it to entries
        const node = modulesToExplore.first()
        modulesToExplore = modulesToExplore.remove(node)
        entries = entries.add(node)

        const removeDepsOf = (dep) => {
            modulesToExplore = modulesToExplore.remove(dep)

            if (trace.has(dep))
                getDependencies(context, dep)
                    .forEach(depToRemove => {
                        if (entries.has(depToRemove)) entries = entries.remove(depToRemove)
                        else if (modulesToExplore.has(depToRemove)) removeDepsOf(depToRemove)
                    })
        }

        removeDepsOf(node)
    }

    return entries.toJS()
        .filter(entry => !entry.includes('jspm_packages'))
}

/**
 * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
 * as well as the root dependencies
 * @param moduleName
 * @param entries
 * @returns {{dependants: Array, entries: Array}}
 */
export const findDependants = (context: Context, moduleName: string, entries: string[]) => {
    const { trace } = context

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
            const directDependants = getDependents(context, dep)

            // Add those to the list of modules to explore
            next.push(...directDependants)
        }
    }

    return {
        // Array of normalized modules that depend on moduleName
        dependants: Array.from(dependents.toJS()) as string[],
        // A guess at which modules are entries (can't accurately determine entries if circular references include them)
        entries: entries.length > 0 ? entries : findEntries(context) as string[]
    }
}


export const getHotModule = (context: Context, moduleName: string) => {
    const { System, logger } = context

    logger(`creating ${getHotName(moduleName)}`)

    return System.newModule({
        // Get previous instance of module or false
        module: System.has(getHotName(moduleName)) ? System.get(moduleName) : false
    })
}

/**
 * Used in System.normalize and System.normalizeSync to normalize @hot to its module
 * and create a hot module if none exists.
 * @param parentName
 */
export const resolveHotModule = (context: Context, parentName: string) => {
    const { System, logger } = context
    const hotName = getHotName(parentName)

    // No hotmodule exists, make and set one
    if (!System.has(hotName)) System.set(hotName, getHotModule(context, parentName))

    logger(`normalising ${parentName} -> ${hotName}`)

    return hotName
}

/**
 * Unload the module from the browser and delete from registry
 * @param moduleName
 */
export const unload = curryN(1, (context: Context, moduleName: string) => {
    const { logger, System } = context

    logger(`unloading ${moduleName}`)

    if (System.has(moduleName)) {
        const module = System.get(moduleName)

        if (typeof module.__unload == 'function')
            module.__unload()
    }

    System.delete(moduleName)
})


export type ReloadOptions = {
    entries: string[],
    preload: string[]
}

/**
 * Discover all modules that depend on moduleName, delete them, then re-import the app entries.
 */
export const reload = curryN(1, (context: Context, moduleName: string, options: any) => {
    const { resolve, trace, logger, System } = context

    options = Object.assign({}, options)

    logger(`reloading ${moduleName} with options ${options}`)

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

    options as ReloadOptions

    return context.lock = context.lock.then(() => {
        logger('queued reload starting')
        return resolve(moduleName)

            .then(name => findDependants(context, name, context.lastImportFailed ? context.entryCache : options.entries))
            .then(({ dependants, entries }) => {
                logger(`found dependents ${dependants} with entries ${entries}`)
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

                logger('deleting dependents')
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
                                hasDependency(context, dependent, resolveHotModule(context, dependent)) ||
                                (module && typeof module.__reload == 'function')
                            ) {
                                logger(`dependent imports @hot`)
                                if (!(SystemJS.has(getHotName(dependent)) && !System.has(dependent)))
                                    SystemJS.set(getHotName(dependent), getHotModule(context, dependent))
                            }

                            // Unload the module from the browser and delete from registry
                            return SystemJS.unload(dependent)
                        })
                }))
                    .then(() => {
                        logger(`dependency tree purged, reimporting entries ${entries}`)
                        context.lastImportFailed = false
                        return Promise.resolve(entries)
                            // resolve all entries
                            .map(x => resolve(x))
                            // import all entries, complain if there was an error, but continue anyway
                            .map(entry => System.import(entry).catch(err => {
                                context.lastImportFailed = true
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
                                module.__reload(System.get(getHotName(dependent)).module)
                            }
                        })

                        if (usedReload && System.warnings)
                            console.warn(
                                'Exporting __reload to reload your module is deprecated, upgrade docs here:',
                                'https://github.com/alexisvincent/systemjs-hmr'
                            )
                    })
            })
    }).catch((err) => console.log(err))
})
