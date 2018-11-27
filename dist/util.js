import { Set } from 'immutable';
import { curryN } from 'ramda';
import Promise from 'bluebird';
export var getVersionInfo = function (System) {
    var _a = System.version.split(' '), full = _a[0], tag = _a[1];
    var _b = full.split('.').map(parseInt), major = _b[0], minor = _b[1], patch = _b[2];
    var is19 = minor == 19, isAtleast20 = minor >= 20;
    return { full: full, tag: tag, major: major, minor: minor, patch: patch, isAtleast20: isAtleast20, is19: is19 };
};
export var makeContext = function (System, logger) {
    var version = getVersionInfo(System);
    var isAtleast20 = version.isAtleast20;
    // Make sure System.trace is set (needed for trace to be fully populated)
    System.trace = true;
    if (isAtleast20)
        System.loads = SystemJS.loads || {};
    var traceIMPL = isAtleast20 ? SystemJS.loads : SystemJS.defined;
    var trace = {
        get: function (moduleID) { return traceIMPL[moduleID] || false; },
        keys: function () { return Object.keys(traceIMPL); },
        values: function () { return Object.values(traceIMPL); },
        has: function (moduleID) { return !!trace.get(moduleID); }
    };
    var context = {
        System: System, version: version, trace: trace, logger: logger,
        // promise lock so that only one reload process can happen at a time
        lock: Promise.resolve(''),
        entryCache: [],
        lastImportFailed: false,
        resolve: isAtleast20 ? SystemJS.resolve : SystemJS.normalize
    };
    /**
     * Override standard normalize function to map calls to @hot to normalizedCallerModuleName!@@hot
     * This needs to be idempotent
     * @param moduleName
     * @param parentName
     * @param parentAddress
     * @returns {*}
     */
    if (isAtleast20) {
        System.resolve = function (moduleName, parentName, parentAddress) {
            if (moduleName == '@hot')
                return Promise.resolve(resolveHotModule(context, parentName));
            else
                return SystemJS.__proto__.resolve.apply(System, [moduleName, parentName, parentAddress]);
        }.bind(System);
    }
    else {
        System.normalize = function (moduleName, parentName, parentAddress) {
            if (moduleName == '@hot')
                return Promise.resolve(resolveHotModule(context, parentName));
            else
                return System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress]);
        }.bind(System);
    }
    return context;
};
// Given the importers module name, returns the name used to store its '@hot' previous instance module
export var getHotName = function (moduleName) { return moduleName + '@hot'; };
// return normalized names of all modules moduleId imports
export var getDependencies = function (_a, moduleId) {
    var minor = _a.version.minor, trace = _a.trace;
    var traceEntry = trace.get(moduleId);
    if (!traceEntry)
        return [];
    else
        switch (minor) {
            case 20: return Object.values(traceEntry.depMap);
            default: return traceEntry.normalizedDeps || [];
        }
};
// does moduleID import normalizedDep
export var hasDependency = function (context, moduleID, normalizedDep) {
    return getDependencies(context, moduleID)
        .some(function (name) { return name == normalizedDep; });
};
// return normalized names of all modules that import this moduleName
export var getDependents = function (context, moduleName) {
    return context.trace.keys()
        .filter(function (dep) { return hasDependency(context, dep, moduleName); });
};
export var findEntries = function (context) {
    var trace = context.trace;
    var entries = Set();
    var modulesToExplore = Set.of.apply(Set, trace.keys());
    var _loop_1 = function () {
        // pick a node and add it to entries
        var node = modulesToExplore.first();
        modulesToExplore = modulesToExplore.remove(node);
        entries = entries.add(node);
        var removeDepsOf = function (dep) {
            modulesToExplore = modulesToExplore.remove(dep);
            if (trace.has(dep))
                getDependencies(context, dep)
                    .forEach(function (depToRemove) {
                    if (entries.has(depToRemove))
                        entries = entries.remove(depToRemove);
                    else if (modulesToExplore.has(depToRemove))
                        removeDepsOf(depToRemove);
                });
        };
        removeDepsOf(node);
    };
    while (modulesToExplore.size > 0) {
        _loop_1();
    }
    return entries.toJS()
        .filter(function (entry) { return !entry.includes('jspm_packages'); });
};
/**
 * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
 * as well as the root dependencies
 * @param moduleName
 * @param entries
 * @returns {{dependants: Array, entries: Array}}
 */
export var findDependants = function (context, moduleName, entries) {
    var trace = context.trace;
    // A queue of modules to explore next, starting with moduleName
    var next = [];
    // If the module exists in the trace, use it as starting point for discovery
    if (trace.has(moduleName))
        next.push(moduleName);
    // A Set of all modules that depend on this one (includes moduleName)
    var dependents = Set();
    // While there are modules to explore (we might have already traversed some of them)
    while (next.length > 0) {
        // Get the first module to explore
        var dep = next.pop();
        // If we haven't already explored it
        if (!dependents.has(dep)) {
            // Add it to the list of explored modules
            dependents = dependents.add(dep);
            // Get a list of the modules that import it
            var directDependants = getDependents(context, dep);
            // Add those to the list of modules to explore
            next.push.apply(next, directDependants);
        }
    }
    return {
        // Array of normalized modules that depend on moduleName
        dependants: Array.from(dependents.toJS()),
        // A guess at which modules are entries (can't accurately determine entries if circular references include them)
        entries: entries.length > 0 ? entries : findEntries(context)
    };
};
export var getHotModule = function (context, moduleName) {
    var System = context.System, logger = context.logger;
    logger("creating " + getHotName(moduleName));
    return System.newModule({
        // Get previous instance of module or false
        module: System.has(getHotName(moduleName)) ? System.get(moduleName) : false
    });
};
/**
 * Used in System.normalize and System.normalizeSync to normalize @hot to its module
 * and create a hot module if none exists.
 * @param parentName
 */
export var resolveHotModule = function (context, parentName) {
    var System = context.System, logger = context.logger;
    var hotName = getHotName(parentName);
    // No hotmodule exists, make and set one
    if (!System.has(hotName))
        System.set(hotName, getHotModule(context, parentName));
    logger("normalising " + parentName + " -> " + hotName);
    return hotName;
};
/**
 * Unload the module from the browser and delete from registry
 * @param moduleName
 */
export var unload = curryN(1, function (context, moduleName) {
    var logger = context.logger, System = context.System;
    logger("unloading " + moduleName);
    if (System.has(moduleName)) {
        var module_1 = System.get(moduleName);
        var unloadFunc = module_1.__unload || (module_1.default ? module_1.default.__unload : undefined);
        if (typeof unloadFunc == 'function')
            unloadFunc();
    }
    System.delete(moduleName);
});
/**
 * Discover all modules that depend on moduleName, delete them, then re-import the app entries.
 */
export var reload = curryN(1, function (context, moduleName, options) {
    var resolve = context.resolve, trace = context.trace, logger = context.logger, System = context.System;
    options = Object.assign({}, options);
    logger("reloading " + moduleName + " with options " + options);
    // Validate params
    if (typeof options != 'object')
        throw new Error("When calling System.reload(_, meta), meta should be an object");
    if (!Array.isArray(options.entries)) {
        if (options.entries == undefined)
            options.entries = false;
        else
            throw new Error("When calling System.reload(_, meta), meta.entries should me an array of normalized module names");
    }
    /**
     * Allow people to pass in a set of modules to load after deleting dependants and before importing the entries.
     * For now this is mocked with an empty array.
     * @type {Array}
     */
    options.preload = [];
    options;
    return context.lock = context.lock.then(function () {
        logger('queued reload starting');
        return resolve(moduleName)
            .then(function (name) { return findDependants(context, name, context.lastImportFailed ? context.entryCache : options.entries); })
            .then(function (_a) {
            var dependants = _a.dependants, entries = _a.entries;
            logger("found dependents " + dependants + " with entries " + entries);
            // Delete all dependent modules
            if (entries.length == 0 && options.entries.length == 0)
                console.warn("systemjs-hmr: We couldn't detect any entries (entry points), this usually", "means you have a circular dependency in your app code. This isn't a problem,", "it just means that you need to specify {entries: [ ...entries ]} as the second argument", "to System.reload. You can read more here: https://github.com/alexisvincent/systemjs-hmr#reload-api.", "This is typically a library level concern, so if you are using a library that provides hot module replacement,", "check how they handle entry points, or if they don't, open an issue with the library.");
            logger('deleting dependents');
            return Promise.all(dependants.map(function (dependent) {
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
                    .then(function (dependent) {
                    var module = SystemJS.get(dependent);
                    if (hasDependency(context, dependent, resolveHotModule(context, dependent)) ||
                        (module && typeof module.__reload == 'function')) {
                        logger("dependent imports @hot");
                        if (!(SystemJS.has(getHotName(dependent)) && !System.has(dependent)))
                            SystemJS.set(getHotName(dependent), getHotModule(context, dependent));
                    }
                    // Unload the module from the browser and delete from registry
                    return SystemJS.unload(dependent);
                });
            }))
                .then(function () {
                logger("dependency tree purged, reimporting entries " + entries);
                context.lastImportFailed = false;
                return Promise.resolve(entries)
                    .map(function (x) { return resolve(x); })
                    .map(function (entry) { return System.import(entry).catch(function (err) {
                    context.lastImportFailed = true;
                    console.error(err.originalErr || err);
                }); })
                    .catch(function (e) { return console.error(e); });
            }).then(function () {
                // Support for the old way of reloading deps
                var usedReload = false;
                dependants.forEach(function (dependent) {
                    var module = SystemJS.get(dependent);
                    if (module && typeof module.__reload == 'function') {
                        usedReload = true;
                        module.__reload(System.get(getHotName(dependent)).module);
                    }
                });
                if (usedReload && System.warnings)
                    console.warn('Exporting __reload to reload your module is deprecated, upgrade docs here:', 'https://github.com/alexisvincent/systemjs-hmr');
            });
        });
    }).catch(function (err) { return console.log(err); });
});
