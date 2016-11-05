let originalSystemImport = System.import
let lastFailedSystemImport = null
let failedReimport = null
let currentHotReload = Promise.resolve()
let modulesJustDeleted = null
let clientImportedModules = []

let d = (...segments) => {
    console.log(
        segments.reduce(
            (message, segment) => message + " " + segment))
}


// We need trace == true for now
if (!System.trace)
    console.warn('System.trace must be set to true via configuration before loading modules to hot-reload.')


// Augment System.import (catch errors and save imported modules)
System.import = function () {
    const args = arguments

    // save all imported files to 'clientImportedModules'
    clientImportedModules.push(args[0])

    return originalSystemImport.apply(System, arguments).catch((e) => {

        // If an import fails, save the import, so that we can try again later
        lastFailedSystemImport = args

        // Pass the exception on
        throw e
    })
}


// Get module information
const getModuleRecord = (moduleName) => {
    return System.normalize(moduleName).then(normalizedName => {

        // Look for moduleName in moduleRocords
        let aModule = System._loader.moduleRecords[normalizedName]

        if (aModule)
            return aModule

        // Look for moduleName in loads
        aModule = System.loads[normalizedName]
        if (aModule)
            return aModule

        // Couldn't find the module in either moduleRecords or loads.
        // Try find full module path in loads

        // Can we find the full module path in System.loads
        const fullModulePath = location.origin + '/' + moduleName
        const loadsKey =
            Object.keys(System.loads)
                .find(n => n.indexOf(fullModulePath) != -1 || System.loads[n].address.indexOf(fullModulePath) != -1)

        // normalize does not yield a key which would match the key used in System.loads, so we have to improvise a bit
        // also, the module name may not match the address for plugins making use of the SystemJS locate hook,
        //   so check the address also
        if (loadsKey)
            return System.loads[loadsKey]

        throw new Error('module was not found in Systemjs moduleRecords')
    })
}

/**
 * Add importers key to all modules in moduleMap, containing all files that depend on it
 * @param moduleMap
 * @param overwriteOlds
 */
const pushImporters = (moduleMap, overwriteOlds) => {

    // Run through all modules in moduleMap
    Object.keys(moduleMap).forEach((moduleName) => {
        // Resolve the module from System.loads
        let mod = System.loads[moduleName]

        // If it doesn't already have an importers key, add it
        if (!mod.importers)
            mod.importers = []

        // Run through all dependencies of the module
        mod.deps.forEach((dependantName) => {
            //resolve the module from loads
            let normalizedDependantName = mod.depMap[dependantName]
            let dependantMod = System.loads[normalizedDependantName]

            // If we couldnt find a module, return
            if (!dependantMod)
                return

            // If it doesn't already have an importers key, add it
            if (!dependantMod.importers)
                dependantMod.importers = []


            if (overwriteOlds) {
                // Get count of current importers
                let imsIndex = dependantMod.importers.length

                // run through dependantMod importer
                while (imsIndex--) {
                    //check if parent is in dependantMod importers list
                    if (dependantMod.importers[imsIndex].name === mod.name) {
                        // if so, overwrite it and return
                        dependantMod.importers[imsIndex] = mod
                        return
                    }
                }
            }

            // Add parent module as importer
            dependantMod.importers.push(mod)
        })
    })
}

// Push initial importers
pushImporters(System.loads)

const reImportRootModules = (toReimport, start) => {
    const promises = toReimport.map((moduleName) => {
        return originalSystemImport.call(System, moduleName).then(moduleReloaded => {
            d('reimported ', moduleName)
            if (typeof moduleReloaded.__reload === 'function') {
                const deletedModule = modulesJustDeleted[moduleName]
                if (deletedModule !== undefined) {
                    moduleReloaded.__reload(deletedModule.exports) // calling module reload hook
                }
            }
        })
    })
    return Promise.all(promises).then(() => {
        // this.emit('allReimported', toReimport)
        pushImporters(modulesJustDeleted, true)
        modulesJustDeleted = {}
        failedReimport = null
        d('all reimported in ', new Date().getTime() - start, 'ms')
    }, (err) => {
        Object.keys(modulesJustDeleted).forEach((modName) => {
            d('deleting on failed reimport: ', modName) // failed import of a module leaves something in the SystemJS module cache, even though it is not visible in System._loader.moduleRecords we need to delete the module to revert to clean state
            System.delete(modName)
        })
        // this.emit('error', err)
        console.error('Module "' + toReimport + '" reimport failed because this error was thrown: ', err)
        failedReimport = toReimport
    })
}

const deleteModule = (moduleToDelete, from) => {
    let name = moduleToDelete.name
    // if module is not in the modulesJustDeleted registry
    if (!modulesJustDeleted[name]) {
        let exportedValue
        // add module to modulesJustDeleted registry
        modulesJustDeleted[name] = moduleToDelete

        if (!moduleToDelete.exports) {
            // this is a module from System.loads
            exportedValue = System.get(name)
            if (!exportedValue) {
                console.warn(`missing exported value on ${name}, reloading whole page because module record is broken`)
                return document.location.reload(true)
            }
        } else {
            exportedValue = moduleToDelete.exports
        }
        if (typeof exportedValue.__unload === 'function') {
            exportedValue.__unload() // calling module unload hook
        }
        System.delete(name)
        // this.emit('deleted', moduleToDelete)
        d('deleted a module ', name, ' because it has dependency on ', from)
    }
}

const reload = (moduleName) => {
    const start = new Date().getTime()
    
    //importers is currently unreliable, because it doesn't automatically catch modules that load after systemjs-hmr
    //so we have to fix up the importers every time we need to use it
    pushImporters(System.loads,true); 

    modulesJustDeleted = {}  // TODO use weakmap
    return getModuleRecord(moduleName).then(module => {
        deleteModule(module, 'origin')
        let toReimport = []

        function deleteAllImporters(mod) {
            let importersToBeDeleted = mod.importers
            return importersToBeDeleted.map((importer) => {
                if (modulesJustDeleted.hasOwnProperty(importer.name)) {
                    d('already deleted', importer.name)
                    return false
                }
                deleteModule(importer, mod.name)
                if (importer.importers.length === 0 && toReimport.indexOf(importer.name) === -1) {
                    toReimport.push(importer.name)
                    return true
                } else {
                    // recourse
                    let deleted = deleteAllImporters(importer)
                    return deleted
                }
            })
        }

        if (typeof module.importers === 'undefined' || module.importers.length === 0) {
            toReimport.push(module.name)
        } else {
            let deleted = deleteAllImporters(module)

            if (deleted.find((res) => res === false))
                toReimport.push(module.name)

        }
        d('toReimport', toReimport)
        if (toReimport.length === 0) {
            toReimport = clientImportedModules
        }
        return reImportRootModules(toReimport, start)
    })
}

System.reload = (moduleName) => {

    if (lastFailedSystemImport) {
        // for when inital System.import fails
        originalSystemImport.apply(System, lastFailedSystemImport).then(() => {
            d(lastFailedSystemImport[0], 'broken module reimported succesfully')
            lastFailedSystemImport = null
        })

    } else if (failedReimport) {
        reImportRootModules(failedReimport, new Date())

    } else {
        // chain promises TODO we can solve this better- this often leads to the same module being reloaded mutliple times
        currentHotReload = currentHotReload.then(() => reload(moduleName))
    }

    return Promise.resolve(true)
}


