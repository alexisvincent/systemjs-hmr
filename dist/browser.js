import debug from 'debug';
import { makeContext, unload, reload } from './util';
// declare const SystemJS: SystemJSLoader.System;
if (!SystemJS)
    console.warn('The systemjs-hmr polyfill must be loaded after SystemJS has loaded');
if (!SystemJS.reload) {
    // Initialise the hmr context against global SystemJS instance, using debug logger
    var logger = function (message, scope) {
        if (scope === void 0) { scope = 'log'; }
        return debug("systemjs-hmr:" + scope)(message);
    };
    SystemJS._hot = makeContext(SystemJS, logger);
    // Polyfill SystemJS.unload
    SystemJS.unload = unload(SystemJS._hot);
    // Polyfill SystemJS.reload
    SystemJS.reload = reload(SystemJS._hot);
}
