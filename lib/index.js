let originalSystemImport = null
let lastFailedSystemImport = null
let failedReimport = null
let currentHotReload = Promise.resolve()
let modulesJustDeleted = null
let clientImportedModules = null

let d = (...segments) => {
    // console.log(
    //     segments.reduce(
    //         (message, segment) => message + " " + segment))
}

const getModuleRecord = (moduleName) => {
    return System.normalize(moduleName).then(normalizedName => {
        let aModule = System._loader.moduleRecords[normalizedName]
        if (!aModule) {
            aModule = System.loads[normalizedName]
            if (aModule) {
                return aModule
            }
            const fullModulePath = location.origin + '/' + moduleName
            const loadsKey = Object.keys(System.loads).find((n) => {
                return (n.indexOf(fullModulePath) !== -1) || (System.loads[n].address.indexOf(fullModulePath) !== -1)
            })
            // normalize does not yield a key which would match the key used in System.loads, so we have to improvise a bit
            // also, the module name may not match the address for plugins making use of the SystemJS locate hook,
            //   so check the address also
            if (loadsKey) {
                return System.loads[loadsKey]
            }
            throw new Error('module was not found in Systemjs moduleRecords')
        }
        return aModule
    })
}


const pushImporters = (moduleMap, overwriteOlds) => {
    Object.keys(moduleMap).forEach((moduleName) => {
        let mod = System.loads[moduleName]
        if (!mod.importers) {
            mod.importers = []
        }
        mod.deps.forEach((dependantName) => {
            let normalizedDependantName = mod.depMap[dependantName]
            let dependantMod = System.loads[normalizedDependantName]
            if (!dependantMod) {
                return
            }
            if (!dependantMod.importers) {
                dependantMod.importers = []
            }
            if (overwriteOlds) {
                let imsIndex = dependantMod.importers.length
                while (imsIndex--) {
                    if (dependantMod.importers[imsIndex].name === mod.name) {
                        dependantMod.importers[imsIndex] = mod
                        return
                    }
                }
            }
            dependantMod.importers.push(mod)
        })
    })
}


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
    if (!modulesJustDeleted[name]) {
        let exportedValue
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
            if (deleted.find((res) => res === false) !== undefined) {
                toReimport.push(module.name)
            }
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


const init = () => {

    if (System.trace !== true) {
        console.warn('System.trace must be set to true via configuration before loading modules to hot-reload.')
    }

    originalSystemImport = System.import

    clientImportedModules = []
    System.import = function () {
        const args = arguments
        clientImportedModules.push(args[0])
        return originalSystemImport.apply(System, arguments).catch((err) => {
            lastFailedSystemImport = args
            throw err
        })
    }

    pushImporters(System.loads)
}

init()
