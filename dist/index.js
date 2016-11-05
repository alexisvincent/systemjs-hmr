'use strict';

var originalSystemImport = System.import;
var lastFailedSystemImport = null;
var failedReimport = null;
var currentHotReload = Promise.resolve();
var modulesJustDeleted = null;
var clientImportedModules = [];

var d = function d() {
    for (var _len = arguments.length, segments = Array(_len), _key = 0; _key < _len; _key++) {
        segments[_key] = arguments[_key];
    }

    console.log(segments.reduce(function (message, segment) {
        return message + " " + segment;
    }));
};

// We need trace == true for now
if (!System.trace) console.warn('System.trace must be set to true via configuration before loading modules to hot-reload.');

// Augment System.import (catch errors and save imported modules)
System.import = function () {
    var args = arguments;

    // save all imported files to 'clientImportedModules'
    clientImportedModules.push(args[0]);

    return originalSystemImport.apply(System, arguments).catch(function (e) {

        // If an import fails, save the import, so that we can try again later
        lastFailedSystemImport = args;

        // Pass the exception on
        throw e;
    });
};

// Get module information
var getModuleRecord = function getModuleRecord(moduleName) {
    return System.normalize(moduleName).then(function (normalizedName) {

        // Look for moduleName in moduleRocords
        var aModule = System._loader.moduleRecords[normalizedName];

        if (aModule) return aModule;

        // Look for moduleName in loads
        aModule = System.loads[normalizedName];
        if (aModule) return aModule;

        // Couldn't find the module in either moduleRecords or loads.
        // Try find full module path in loads

        // Can we find the full module path in System.loads
        var fullModulePath = location.origin + '/' + moduleName;
        var loadsKey = Object.keys(System.loads).find(function (n) {
            return n.indexOf(fullModulePath) != -1 || System.loads[n].address.indexOf(fullModulePath) != -1;
        });

        // normalize does not yield a key which would match the key used in System.loads, so we have to improvise a bit
        // also, the module name may not match the address for plugins making use of the SystemJS locate hook,
        //   so check the address also
        if (loadsKey) return System.loads[loadsKey];

        throw new Error('module was not found in Systemjs moduleRecords');
    });
};

/**
 * Add importers key to all modules in moduleMap, containing all files that depend on it
 * @param moduleMap
 * @param overwriteOlds
 */
var pushImporters = function pushImporters(moduleMap, overwriteOlds) {

    // Run through all modules in moduleMap
    Object.keys(moduleMap).forEach(function (moduleName) {
        // Resolve the module from System.loads
        var mod = System.loads[moduleName];

        // If it doesn't already have an importers key, add it
        if (!mod.importers) mod.importers = [];

        // Run through all dependencies of the module
        mod.deps.forEach(function (dependantName) {
            //resolve the module from loads
            var normalizedDependantName = mod.depMap[dependantName];
            var dependantMod = System.loads[normalizedDependantName];

            // If we couldnt find a module, return
            if (!dependantMod) return;

            // If it doesn't already have an importers key, add it
            if (!dependantMod.importers) dependantMod.importers = [];

            if (overwriteOlds) {
                // Get count of current importers
                var imsIndex = dependantMod.importers.length;

                // run through dependantMod importer
                while (imsIndex--) {
                    //check if parent is in dependantMod importers list
                    if (dependantMod.importers[imsIndex].name === mod.name) {
                        // if so, overwrite it and return
                        dependantMod.importers[imsIndex] = mod;
                        return;
                    }
                }
            }

            // Add parent module as importer
            dependantMod.importers.push(mod);
        });
    });
};

// Push initial importers
pushImporters(System.loads);

var reImportRootModules = function reImportRootModules(toReimport, start) {
    var promises = toReimport.map(function (moduleName) {
        return originalSystemImport.call(System, moduleName).then(function (moduleReloaded) {
            d('reimported ', moduleName);
            if (typeof moduleReloaded.__reload === 'function') {
                var deletedModule = modulesJustDeleted[moduleName];
                if (deletedModule !== undefined) {
                    moduleReloaded.__reload(deletedModule.exports); // calling module reload hook
                }
            }
        });
    });
    return Promise.all(promises).then(function () {
        // this.emit('allReimported', toReimport)
        pushImporters(modulesJustDeleted, true);
        modulesJustDeleted = {};
        failedReimport = null;
        d('all reimported in ', new Date().getTime() - start, 'ms');
    }, function (err) {
        Object.keys(modulesJustDeleted).forEach(function (modName) {
            d('deleting on failed reimport: ', modName); // failed import of a module leaves something in the SystemJS module cache, even though it is not visible in System._loader.moduleRecords we need to delete the module to revert to clean state
            System.delete(modName);
        });
        // this.emit('error', err)
        console.error('Module "' + toReimport + '" reimport failed because this error was thrown: ', err);
        failedReimport = toReimport;
    });
};

var deleteModule = function deleteModule(moduleToDelete, from) {
    var name = moduleToDelete.name;
    // if module is not in the modulesJustDeleted registry
    if (!modulesJustDeleted[name]) {
        var exportedValue = void 0;
        // add module to modulesJustDeleted registry
        modulesJustDeleted[name] = moduleToDelete;

        if (!moduleToDelete.exports) {
            // this is a module from System.loads
            exportedValue = System.get(name);
            if (!exportedValue) {
                console.warn('missing exported value on ' + name + ', reloading whole page because module record is broken');
                return document.location.reload(true);
            }
        } else {
            exportedValue = moduleToDelete.exports;
        }
        if (typeof exportedValue.__unload === 'function') {
            exportedValue.__unload(); // calling module unload hook
        }
        System.delete(name);
        // this.emit('deleted', moduleToDelete)
        d('deleted a module ', name, ' because it has dependency on ', from);
    }
};

var reload = function reload(moduleName) {
    var start = new Date().getTime();

    //importers is currently unreliable, because it doesn't automatically catch modules that load after systemjs-hmr
    //so we have to fix up the importers every time we need to use it
    pushImporters(System.loads, true);

    modulesJustDeleted = {}; // TODO use weakmap
    return getModuleRecord(moduleName).then(function (module) {
        deleteModule(module, 'origin');
        var toReimport = [];

        function deleteAllImporters(mod) {
            var importersToBeDeleted = mod.importers;
            return importersToBeDeleted.map(function (importer) {
                if (modulesJustDeleted.hasOwnProperty(importer.name)) {
                    d('already deleted', importer.name);
                    return false;
                }
                deleteModule(importer, mod.name);
                if (importer.importers.length === 0 && toReimport.indexOf(importer.name) === -1) {
                    toReimport.push(importer.name);
                    return true;
                } else {
                    // recourse
                    var deleted = deleteAllImporters(importer);
                    return deleted;
                }
            });
        }

        if (typeof module.importers === 'undefined' || module.importers.length === 0) {
            toReimport.push(module.name);
        } else {
            var deleted = deleteAllImporters(module);

            if (deleted.find(function (res) {
                return res === false;
            })) toReimport.push(module.name);
        }
        d('toReimport', toReimport);
        if (toReimport.length === 0) {
            toReimport = clientImportedModules;
        }
        return reImportRootModules(toReimport, start);
    });
};

System.reload = function (moduleName) {

    if (lastFailedSystemImport) {
        // for when inital System.import fails
        originalSystemImport.apply(System, lastFailedSystemImport).then(function () {
            d(lastFailedSystemImport[0], 'broken module reimported succesfully');
            lastFailedSystemImport = null;
        });
    } else if (failedReimport) {
        reImportRootModules(failedReimport, new Date());
    } else {
        // chain promises TODO we can solve this better- this often leads to the same module being reloaded mutliple times
        currentHotReload = currentHotReload.then(function () {
            return reload(moduleName);
        });
    }

    return Promise.resolve(true);
};