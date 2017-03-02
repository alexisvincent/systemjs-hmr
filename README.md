# SystemJS HMR
[![npm version](https://badge.fury.io/js/systemjs-hmr.svg)](https://badge.fury.io/js/systemjs-hmr)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
 
`systemjs-hmr` provides the official hot module replacement implementation for [SystemJS](https://github.com/systemjs/systemjs) 
via a ```System.reload``` function and extends [SystemJS](https://github.com/systemjs/systemjs)  with an `System.unload` function to 
cleanly unload modules (js, css, scss etc) from the browser.

### Please note, this library will not give you hot reloading out of the box, if thats what you are looking for, checkout [systemjs-hot-reloader](https://github.com/alexisvincent/systemjs-hot-reloader) or [systemjs-tools](https://github.com/alexisvincent/systemjs-tools)

## Goal
The goal of this project is to implement HMR primitives for [SystemJS](https://github.com/systemjs/systemjs) that can be battle tested and later added to the core project.
***SystemJS HMR*** is meant to be used as an HMR enabler for library creators rather then providing a full HMR experience
for application developers, if you're looking to implement HMR in your own project take a look at
[systemjs-hot-reloader](https://github.com/alexisvincent/systemjs-hot-reloader) or [systemjs-tools](https://github.com/alexisvincent/systemjs-tools)
both of which use this project under the hood.

We want to introduce a minimal API change to [SystemJS](https://github.com/systemjs/systemjs) and build in such a fashion as to enable smooth assimilation into core further down the line.
This project will only implement the logic required to enable HMR,
and as such things akin to the eventing api found in [systemjs-hot-reloader](https://github.com/alexisvincent/systemjs-hot-reloader)
or [systemjs-tools](https://github.com/alexisvincent/systemjs-tools) are left to the library/application developer.

## Usage
Install with your client-side package manager
- `jspm install npm:systemjs-hmr`
- `yarn add systemjs-hmr`
- `npm install systemjs-hmr`

`systemjs-hmr` requires SystemJS `>0.19.x or >=0.20.8`.

`systemjs-hmr` **MUST** load before your application code otherwise SystemJS
won't know how to resolve your `@hot` imports. So either add a script tag
to your header after loading SystemJS

```html
<script src="jspm_packages/npm/systemjs-hmr@version/dist/systemjs-hmr.js"></script>
```

or import systemjs-hmr **before** importing your app code.

```html
<script>
    System.import('systemjs-hmr').then(() => {
        System.import('app/app.js')
    })
</script>
```

Until SystemJS does automatically, you need to tell SystemJS how to handle
the `@hot` imports when building your app. To do this, add the following to
your jspm config file.

```js
{
  ...
  "map": {
    ...
    "@hot": "@empty"
  }
}
```

`systemjs-hmr` will automatically set `SystemJS.trace = true`, so you no longer
need to set this manually, as with previous versions.

### State Hydration and Safe Module Unloads
##### (see [#2](https://github.com/alexisvincent/systemjs-hmr/issues/2) for discussion / proposals)

When hot module replacement is added to an application there are a few modifications we may need to
make to our code base, since the assumption that your code will run exactly once has been broken.

When a new version of a module is imported it might very well want to reinitialize it's own state based 
on the state of the previous module instance, to deal with this case and to cleanly unload your module
from the registry you can import the previous instance of your module as you would any other module,
as well as export an `__unload` function.

```javascript
/**
 * You can import the previous instance of your module as you would any other module.
 * On first load, module == false.
 */
import { module } from '@hot'

/** 
 * Since all exports of the previous instance are available, you can simply export any state you might want to persist.
 *
 * Here we set and export the state of the file. If 'module == false' (first load),
 * then initialise the state to {}, otherwise set the state to the previously exported
 * state.
 */
export const _state = module ? module._state : {}

/**
 * If you're module needs to run some 'cleanup' code before being unloaded from the system, it can do so,
 * by exporting an `__unload` function that will be run just before the module is deleted from the registry.
 *
 * Here you would unsubscribe from listeners, or any other task that might cause issues in your application,
 * or prevent the module from being garbage collected.
 *
 * See SystemJS.unload API for more information.
 */
export const __unload = () => {
    console.log('Unload something (unsubscribe from listeners, disconnect from socket, etc...)')
    // force unload React components
    ReactDOM.unmountComponentAtNode(DOMNode);	// your container node
}
```

## API

### SystemJS.**reload**(moduleName, [options])

Where
- `moduleName` is a String of the same kind you would provide to ```System.load``` or ```System.import``` when importing a module.
- `options` is an optional object containing information to help speedup the reload process (module sources, dependency trees, etc.)

options has the following (all optional) keys (but the API is still being built so you can expect this to change)

`entries : [String]`
An array of top level entry points into the application. If entry points aren't provided, systemjs-hmr will discover them
automatically (slower).

`others` Other options will be exposed to speedup the reload process. For example, pre-calculated dependency trees, pre-fetched module sources, etc.

### SystemJS.**unload**(moduleName)
A drop in replacement for `SystemJS.delete(moduleName)`.

Checks if the module exports an `__unload` function, i.e. if `typeof SystemJS.get(moduleName).__unload === 'function'`,
if so, this function is executed.

Finally, `SystemJS.delete(moduleName)` is executed. 


## Extending hot-reloading for your own loader
In a traditional application one does not usually have to deal with modules being deleted/unloaded, naturally HMR requires
us to start thinking about what happens when we unload a module in-order to replace it. Now unloading `javascript` is naturally
different then say to `css`. With `javascript` we need to let the module itself handle some of the unloading
(unsubscribing from event listeners, unmounting dom nodes, etc) and then delete it from the SystemJS registry.
With `css` however, we simply need to delete the *link* node from the DOM.

Evidently this is a plugin level decision and as such as a loader author, if you would like to make your loader compatible with HMR,
simply make sure the instantiated JS module (that will be set in the registry) exports an `__unload` function. This will be called
by `SystemJS.unload` during the HMR process.

This ends up cleanly catering for the general case where a module is deleted (via `SystemJS.unload`) as well as the reload situation.

## Roadmap
- [x] construct functioning reload mechanism
- [x] state hydration mechanisms
- [x] set SystemJS.trace = true automatically
- [x] disable HMR in production
- [x] [robustness (better error handling)](https://github.com/alexisvincent/systemjs-hmr/issues/11)
- [x] backwards compatibility for old `__unload`
- [x] [SystemJS 0.20 support](https://github.com/alexisvincent/systemjs-hmr/issues/6)
- [x] polyfill like experience instead of `SystemJS.import` instantiation
- [x] [bundle](https://github.com/alexisvincent/systemjs-hmr/issues/10)
- [x] backwards compatibility for old `__reload` with deprecation
- [x] handle circular dependencies in entry points
- [ ] speed up `findDependents` via an internal cache and graph representation
- [ ] [preemptive file loading **- optimization**](https://github.com/alexisvincent/systemjs-hmr/issues/12)
- [ ] [prevent reloading dependants **- optimization**](https://github.com/alexisvincent/systemjs-hmr/issues/12)
