'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var originalSystemImport = null;
var lastFailedSystemImport = null;
var failedReimport = null;
var currentHotReload = Promise.resolve();
var modulesJustDeleted = null;
var clientImportedModules = null;

var d = function d() {
    // console.log(
    //     segments.reduce(
    //         (message, segment) => message + " " + segment))
};

var getModuleRecord = function getModuleRecord(moduleName) {
    return System.normalize(moduleName).then(function (normalizedName) {
        var aModule = System._loader.moduleRecords[normalizedName];
        if (!aModule) {
            var _ret = function () {
                aModule = System.loads[normalizedName];
                if (aModule) {
                    return {
                        v: aModule
                    };
                }
                var fullModulePath = location.origin + '/' + moduleName;
                var loadsKey = Object.keys(System.loads).find(function (n) {
                    return n.indexOf(fullModulePath) !== -1 || System.loads[n].address.indexOf(fullModulePath) !== -1;
                });
                // normalize does not yield a key which would match the key used in System.loads, so we have to improvise a bit
                // also, the module name may not match the address for plugins making use of the SystemJS locate hook,
                //   so check the address also
                if (loadsKey) {
                    return {
                        v: System.loads[loadsKey]
                    };
                }
                throw new Error('module was not found in Systemjs moduleRecords');
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
        return aModule;
    });
};

var pushImporters = function pushImporters(moduleMap, overwriteOlds) {
    Object.keys(moduleMap).forEach(function (moduleName) {
        var mod = System.loads[moduleName];
        if (!mod.importers) {
            mod.importers = [];
        }
        mod.deps.forEach(function (dependantName) {
            var normalizedDependantName = mod.depMap[dependantName];
            var dependantMod = System.loads[normalizedDependantName];
            if (!dependantMod) {
                return;
            }
            if (!dependantMod.importers) {
                dependantMod.importers = [];
            }
            if (overwriteOlds) {
                var imsIndex = dependantMod.importers.length;
                while (imsIndex--) {
                    if (dependantMod.importers[imsIndex].name === mod.name) {
                        dependantMod.importers[imsIndex] = mod;
                        return;
                    }
                }
            }
            dependantMod.importers.push(mod);
        });
    });
};

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
    if (!modulesJustDeleted[name]) {
        var exportedValue = void 0;
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
            }) !== undefined) {
                toReimport.push(module.name);
            }
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

var init = function init() {

    if (System.trace !== true) {
        console.warn('System.trace must be set to true via configuration before loading modules to hot-reload.');
    }

    originalSystemImport = System.import;

    clientImportedModules = [];
    System.import = function () {
        var args = arguments;
        clientImportedModules.push(args[0]);
        return originalSystemImport.apply(System, arguments).catch(function (err) {
            lastFailedSystemImport = args;
            throw err;
        });
    };

    pushImporters(System.loads);
};

init();