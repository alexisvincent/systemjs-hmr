// import ajv from 'ajv'
import d from 'debug';
import Promise from 'bluebird';
// import type from '@type/systemjs'
// import {Graph}  from 'imgraphjs'
import { Set } from 'immutable';
var log = d('systemjs-hmr:log');
// Make sure SystemJS has loaded
if (!SystemJS)
    console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded');
var version = SystemJS.version.split(' ')[0].split('.')[1];
var is19 = version == '19', is20 = version == '20';
if (!SystemJS._reloader) {
    if (!(is19 || is20))
        console.warn('Only support for SystemJS 0.19 and 0.20 has been tested. You are using', SystemJS.version, '. If you are having success with this version, please let us know so we can add it to the list of known working versions');
    // Make sure System.trace is set (needed for trace to be fully populated)
    SystemJS.trace = true;
    if (is20)
        SystemJS.loads = SystemJS.loads || {};
    var trace_1 = {
        _: is20 ? SystemJS.loads : SystemJS.defined,
        get: function (moduleID) { return trace_1._[moduleID]; },
        keys: function () { return Object.keys(trace_1._); },
        values: function () { return Object.values(trace_1._); },
        has: function (moduleID) { return !!trace_1.get(moduleID); },
        // return normalized names of all modules moduleId imports
        getDependencies: function (moduleId) {
            var traceEntry = trace_1.get(moduleId);
            if (!traceEntry)
                return [];
            else if (is20)
                return Object.values(traceEntry.depMap);
            else if (is19 || true)
                return traceEntry.normalizedDeps || [];
        },
        // does moduleID import normalizedDep
        hasDependency: function (moduleID, normalizedDep) { return trace_1.getDependencies(moduleID).some(function (name) { return name == normalizedDep; }); },
        // return normalized names of all modules that import this moduleName
        getDependents: function (moduleName) { return trace_1.keys().filter(function (dep) { return trace_1.hasDependency(dep, moduleName); }); }
    };
    // Stores state systemjs-hmr needs access to
    var _1 = SystemJS._reloader = {
        // promise lock so that only one reload process can happen at a time
        lock: Promise.resolve(true),
        trace: trace_1,
        entryCache: [],
        lastImportFailed: false,
        // **Experimental** Construct a per module persistent object
        _persistentRegistry: {},
        _getState: function (name) {
            if (!_1._persistentRegistry[name])
                _1._persistentRegistry[name] = {};
            return _1._persistentRegistry[name];
        }
    };
    // Given the importers module name, returns the name used to store its '@hot' previous instance module
    var getHotName_1 = function (moduleName) { return moduleName + '@hot'; };
    var getHotModule_1 = function (moduleName) {
        d('systemjs-hmr:createHotModule')(moduleName);
        return SystemJS.newModule({
            // Get previous instance of module or false
            module: SystemJS.has(getHotName_1(moduleName)) ? SystemJS.get(moduleName) : false,
            // **Experimental** Get persistent state object
            _state: _1._getState(moduleName)
        });
    };
    /**
     * Used in System.normalize and System.normalizeSync to normalize @hot to its module
     * and create a hot module if none exists.
     * @param parentName
     */
    var resolveHotModule_1 = function (parentName) {
        var hotName = parentName + "@hot";
        // No hotmodule exists, make and set one
        if (!SystemJS.has(hotName))
            SystemJS.set(hotName, getHotModule_1(parentName));
        d('systemjs-hmr:normalize')(parentName, '->', hotName);
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
    if (is20) {
        SystemJS.resolve = function (moduleName, parentName, parentAddress) {
            if (moduleName == '@hot')
                return Promise.resolve(resolveHotModule_1(parentName));
            else
                return SystemJS.__proto__.resolve.apply(SystemJS, [moduleName, parentName, parentAddress]);
        }.bind(SystemJS);
    }
    else {
        SystemJS.normalize = function (moduleName, parentName, parentAddress) {
            if (moduleName == '@hot')
                return Promise.resolve(resolveHotModule_1(parentName));
            else
                return SystemJS.__proto__.normalize.apply(SystemJS, [moduleName, parentName, parentAddress]);
        }.bind(SystemJS);
    }
    var resolve_1 = is20 ? SystemJS.resolve : SystemJS.normalize;
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
    var findEntries_1 = function () {
        var entries = Set();
        var modulesToExplore = Set.of.apply(Set, trace_1.keys());
        var _loop_1 = function () {
            // pick a node and add it to entries
            var node = modulesToExplore.first();
            modulesToExplore = modulesToExplore.remove(node);
            entries = entries.add(node);
            var removeDepsOf = function (dep) {
                modulesToExplore = modulesToExplore.remove(dep);
                if (trace_1.has(dep))
                    trace_1.getDependencies(dep).forEach(function (depToRemove) {
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
        return entries.toJS().filter(function (entry) { return !entry.includes('jspm_packages'); });
    };
    /**
     * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
     * as well as the root dependencies
     * @param moduleName
     * @param entries
     * @returns {{dependants: Array, entries: Array}}
     */
    var findDependants_1 = function (moduleName, entries) {
        // A queue of modules to explore next, starting with moduleName
        var next = [];
        // If the module exists in the trace, use it as starting point for discovery
        if (trace_1.has(moduleName))
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
                var directDependants = trace_1.getDependents(dep);
                // Add those to the list of modules to explore
                next.push.apply(next, directDependants);
            }
        }
        return {
            // Array of normalized modules that depend on moduleName
            dependants: Array.from(dependents.toJS()),
            // A guess at which modules are entries (can't accurately determine entries if circular references include them)
            entries: entries.length > 0 ? entries : findEntries_1()
        };
    };
    /**
     * Unload the module from the browser and delete from registry
     * @param moduleName
     */
    SystemJS.unload = function (moduleName) {
        var debug = d('systemjs-hmr:reload');
        debug('unloading', moduleName);
        if (SystemJS.has(moduleName)) {
            var module_1 = SystemJS.get(moduleName);
            if (typeof module_1.__unload == 'function')
                module_1.__unload();
        }
        SystemJS.delete(moduleName);
    };
    /**
     * System.reload
     * Discover all modules that depend on moduleName, delete them, then re-import the app entries.
     */
    SystemJS.reload = function (moduleName, options) {
        if (options === void 0) { options = {}; }
        options = Object.assign({}, options);
        var debug = d('systemjs-hmr:reload');
        debug('reloading', moduleName, 'with options', options);
        log('reloading', moduleName);
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
        return _1.lock = _1.lock.then(function () {
            debug('queued reload starting');
            return resolve_1(moduleName)
                .then(function (name) { return findDependants_1(name, _1.lastImportFailed ? _1.entryCache : options.entries); })
                .then(function (_a) {
                var dependants = _a.dependants, entries = _a.entries;
                debug('found dependents', dependants, 'with entries', entries);
                // Delete all dependent modules
                if (entries.length == 0 && options.entries.length == 0)
                    console.warn("systemjs-hmr: We couldn't detect any entries (entry points), this usually", "means you have a circular dependency in your app code. This isn't a problem,", "it just means that you need to specify {entries: [ ...entries ]} as the second argument", "to System.reload. You can read more here: https://github.com/alexisvincent/systemjs-hmr#reload-api.", "This is typically a library level concern, so if you are using a library that provides hot module replacement,", "check how they handle entry points, or if they don't, open an issue with the library.");
                debug('deleting dependents');
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
                    return resolve_1(dependent)
                        .then(function (dependent) {
                        var module = SystemJS.get(dependent);
                        if (trace_1.hasDependency(dependent, resolveHotModule_1(dependent)) ||
                            (module && typeof module.__reload == 'function')) {
                            debug(dependent, 'imports @hot');
                            if (!(SystemJS.has(getHotName_1(dependent)) && !SystemJS.has(dependent)))
                                SystemJS.set(getHotName_1(dependent), getHotModule_1(dependent));
                        }
                        // Unload the module from the browser and delete from registry
                        return SystemJS.unload(dependent);
                    });
                }))
                    .then(function () {
                    log('dependency tree purged, reimporting entries', entries);
                    _1.lastImportFailed = false;
                    return Promise.resolve(entries)
                        .map(function (x) { return resolve_1(x); })
                        .map(function (entry) { return SystemJS.import(entry).catch(function (err) {
                        _1.lastImportFailed = true;
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
                            module.__reload(SystemJS.get(getHotName_1(dependent)).module);
                        }
                    });
                    if (usedReload && SystemJS.warnings)
                        console.warn('Exporting __reload to reload your module is deprecated, upgrade docs here:', 'https://github.com/alexisvincent/systemjs-hmr');
                });
            });
        }).catch(function (err) { return console.log(err); });
    };
}
