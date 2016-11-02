# SystemJS HMR
Hot Module Replacement for SystemJS

SystemJS HMR extends SystemJS with a ```System.reload``` function, augments ```System.delete``` and introduces two new loader plugin hooks.

##Goal
The goal of this project is to implement HMR primitives for SystemJS that can be battle tested and later be added to the core project.
***SystemJS HMR*** is meant to be used as an HMR enabler for library creators rather then providing a full HMR experience
for application developers, if you're looking to implement HMR in your own project take a look at
[capaj/systemjs-hot-reloader](https://github.com/capaj/systemjs-hot-reloader).

We want to introduce a minimal API change to SystemJS and build in such a fashion as to enable smooth assimilation into core further down the line.
This project will only implement the logic required to enable HMR,
and as such things akin to the eventing api found in [capaj/systemjs-hot-reloader](https://github.com/capaj/systemjs-hot-reloader) are left to the library/application implementer.

## Motivation
Integrating HMR into core will add to the tooling capacity of the project and allow for interesting integrations.
While [capaj/systemjs-hot-reloader](https://github.com/capaj/systemjs-hot-reloader) is great at an application level,
it forces you to use its own events API which is problematic for anyone trying to create tooling around SystemJS & HMR.
And while it is possible to implement your own HMR logic void of an events system, HMR is a straight forward enough problem
(at least where SystemJS is concerned) that this logic could be appropriately included into the core project.
The lack of supporting tooling built around SystemJS is one of the core reasons SystemJS feels 'hard'
for new users and proper HMR support will go a long way to increase developer interest in the project.

## Loader Plugin Unload Hook

In a traditional application one does not usually have to deal with modules being deleted/unloaded, naturally HMR requires
us to start thinking about what happens when we unload a module in-order to replace it. Now unloading ```js``` is naturally
different then say to ```css```. With ```javascript``` we need to let the module itself handle some of the unloading
(unsubscribing from event listeners, unmounting dom nodes, etc) and then delete it from the SystemJS registry.
With ```css``` however, we simply need to delete the *link* node from the DOM.

Evidently this is a plugin level decision and as such we introduce an ```unload``` hook into the loader plugin API. Loaders can now export
an ```unload``` hook to heal with any cleanup that needs to happen before deleting a module from the SystemJS registry.

To support this we augment the ```System.delete``` function with a call to the plugins ```unload```
hook, providing it with the module name, before calling the original ```System.delete``` function. [This needs thought]

This ```unload``` extension ends up cleanly catering for the general case where a module is forcefully deleted as well as the reload situation.

### Javascript Plugin Unload Hook Proposal

Any JS module can optionally export an ```__unload``` function, which will be triggered by the js loader.

module.js
```js
...

export function __unload() {
    unsubscribeFromListener();
    cleanupOtherStuff();
    ...
}
```

### CSS Plugin Unload Hook Proposal

The css ```unload``` hook would simply remove the *link* node from the DOM.

This should solve the following issues:
- https://github.com/systemjs/plugin-css/issues/81
- https://github.com/capaj/systemjs-hot-reloader/issues/37.

Providing us with true CSS/SCSS reloading.

## State Hydration and the Loader Plugin Reload Hook

When a new version of a module is imported it will probably want to reinitialize its own state based on the state of the
previous version. For example a component containing the client application state might want to perform the following operation.

```js
if (reloading) {
    this.state = oldModule.state
}
```

to account for this, and the fact that future plugins might want to be able to handle their own reload behaviour. We call an
optionally exported plugin reload hook.

### See https://github.com/alexisvincent/systemjs-hmr/issues/2 for current proposals

## Reload API

Finally, all that is left for this project is to expose the following new SystemJS extension.

```js
SystemJS.reload(moduleName, moduleSource)
```
Where
- moduleName is a String of the same kind you would provide to ```System.import``` if importing a module.
- moduleSource is an optional String parameter containing the source code of the module that SystemJS would fetch if
```System.import(moduleName)``` was called.

The ```reload``` function recursively calls the plugin loader unload hook, deletes the module and all modules that depend on it (directly or indirectly).
It then reimports the root of the deleted dependency tree (which will first load it's missing dependencies),
and runs the plugin loader reload hooks of each imported module.

## That's all folks
