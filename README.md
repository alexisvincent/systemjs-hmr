# SystemJS HMR
Hot module replacement primatives for SystemJS

SystemJS HMR currently extends SystemJS with a ```System.reload``` function and proposes a new `unload` loader plugin hook.

##Goal
The goal of this project is to implement HMR primitives for SystemJS that can be battle tested and later added to the core project.
***SystemJS HMR*** is meant to be used as an HMR enabler for library creators rather then providing a full HMR experience
for application developers, if you're looking to implement HMR in your own project take a look at
[capaj/systemjs-hot-reloader](https://github.com/capaj/systemjs-hot-reloader) or [alexisvincent/jspm-devtools](https://github.com/alexisvincent/jspm-devtools).

We want to introduce a minimal API change to SystemJS and build in such a fashion as to enable smooth assimilation into core further down the line.
This project will only implement the logic required to enable HMR,
and as such things akin to the eventing api found in [capaj/systemjs-hot-reloader](https://github.com/capaj/systemjs-hot-reloader) 
or [alexisvincent/jspm-devtools](https://github.com/alexisvincent/jspm-devtools) are left to the library/application developer.

## Reload API
```js
SystemJS.reload(moduleName, meta)
```
Where
- `moduleName` is a String of the same kind you would provide to ```System.load``` or ```System.import``` when importing a module.
- `meta` is an optional object containing information to help speedup the reload process (module sources, dependency trees, etc.)

meta has the following (all optional) keys (but the API is still being built so you can expect this to change)

`roots : [String]`
An array of top level entry points into the application. If entry points aren't provided, systemjs-hmr will attempt to discover them
automatically by determining which modules depend on `moduleName`, and are not imported by other modules. This only works when there are
no circular dependencies involving roots.

`others` Other options will be exposed to speedup the reload process. For example, pre-calculated dependency trees, pre-fetched module sources, etc.

## State Hydration and Safe Unloads 
### (see [#2](https://github.com/alexisvincent/systemjs-hmr/issues/2) for discussion / proposals)

```javascript
// You can import the previous module instance from '@hot'
// During the first load, module == false
import { module } from '@hot'

/** 
* When a new version of a module is imported it will probably want to 
* reinitialize it's own state based on the state of the previous version.
* Since all exports of the previous instance are available, you can 
* simply export any state you might want to persist.
*/
export const _state = module ? module._state : {}

/**
 * You can safely unload/unmount/cleanup anything by exporting an unload function
 * and then calling it whenever you reload (if module is something other then false)
 */
export const _unload = () => {
    console.log('Unload something (unsubscribe from listeners, disconnect from socket, etc...)')
}

if(module)
    module._unload()

```

## Motivation
Integrating HMR into core will add to the tooling capacity of the project and allow for interesting integrations.
While [capaj/systemjs-hot-reloader](https://github.com/capaj/systemjs-hot-reloader) is great at an application level,
it forces you to use its own events API which is problematic for anyone trying to create tooling around SystemJS & HMR.
And while it is possible to implement your own HMR logic void of an events system, HMR is a straight forward enough problem
(at least where SystemJS is concerned) that this logic could be appropriately included into the core project.
The lack of supporting tooling built around SystemJS is one of the core reasons SystemJS feels 'hard'
for new users and proper HMR support will go a long way to increase developer interest in the project.

## Loader Plugin Unload Hook Proposal
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

### CSS Plugin Unload Hook Proposal

The css ```unload``` hook would simply remove the *link* node from the DOM.

This should solve the following issues:
- https://github.com/systemjs/plugin-css/issues/81
- https://github.com/capaj/systemjs-hot-reloader/issues/37.

Providing us with true CSS/SCSS reloading.

## That's all folks
