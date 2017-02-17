(function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d$1 = h * 24;
var y = d$1 * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var index = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d$1
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d$1) {
    return Math.round(ms / d$1) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d$1, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

var debug = createCommonjsModule(function (module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = index;

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index$$1 = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index$$1++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index$$1];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index$$1, 1);
        index$$1--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
});

var browser$1 = createCommonjsModule(function (module, exports) {
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window && window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};























































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Copyright 2016 Alexis Vincent (http://alexisvincent.io)
 */
// import ajv from 'ajv'
var log$$1 = browser$1('systemjs-hmr:log');

// Make sure SystemJS has loaded
if (!window.System && !!window.SystemJS) console.warn('The systemjs-hmr polyfill must be loading after SystemJS has loaded');

// Bind and shadow the reference we will be using
var System = window.SystemJS;

var version = System.version.split(' ')[0].split('.')[1];

var is19 = version == '19';
var is20 = version == '20';

if (!System._reloader) {

  if (!(is19 || is20)) console.warn('Only support for SystemJS 0.19 and 0.20 has been tested. You are using', System.version, '. If you are having success with this version, please let us know so we can add it to the list of known working versions');

  // Make sure System.trace is set (needed for trace to be fully populated)
  System.trace = true;

  var trace = {
    _: is20 ? System.loads : System.defined,
    get: function get$$1(moduleID) {
      return trace._[moduleID];
    },
    keys: function keys() {
      return Object.keys(trace._);
    },
    values: function values() {
      return Object.values(trace._);
    },
    has: function has(moduleID) {
      return !!trace.get(moduleID);
    },

    // return normalized names of all modules moduleId imports
    getDependencies: function getDependencies(moduleId) {
      var traceEntry = trace.get(moduleId);

      if (is20) {
        return Object.values(traceEntry.depMap);
      } else if (is19 || true) {
        return traceEntry.normalizedDeps || [];
      }
    },

    // does moduleID import normalizedDep
    hasDependency: function hasDependency(moduleID, normalizedDep) {
      return trace.getDependencies(moduleID).some(function (name) {
        return name == normalizedDep;
      });
    },

    // return normalized names of all modules that import this moduleName
    getDependents: function getDependents(moduleName) {
      return trace.keys().filter(function (dep) {
        return trace.hasDependency(dep, moduleName);
      });
    }
  };

  // Stores state systemjs-hmr needs access to
  var _ = System._reloader = {
    // promise lock so that only one reload process can happen at a time
    lock: Promise.resolve(true),

    trace: trace,

    // **Experimental** Construct a per module persistent object
    _persistentRegistry: {},
    _getState: function _getState(name) {
      if (!_._persistentRegistry[name]) _._persistentRegistry[name] = {};

      return _._persistentRegistry[name];
    }
  };

  // Given the importers module name, returns the name used to store its '@hot' previous instance module
  var getHotName = function getHotName(moduleName) {
    return moduleName + '@hot';
  };

  var createHotModule = function createHotModule(moduleName) {
    browser$1('systemjs-hmr:createHotModule')(moduleName);

    if (!System.has(getHotName(moduleName))) {
      return SystemJS.newModule({
        // Get previous instance of module
        module: false,
        // **Experimental** Get persistent state object
        _state: _._getState(moduleName)
      });
    } else {
      return System.newModule({
        module: System.get(moduleName),
        // **Experimental** Get persistent state object
        _state: _._getState(moduleName)
      });
    }
  };

  /**
   * Used in System.normalize and System.normalizeSync to normalize @hot to its module
   * and create a hot module if none exists.
   * @param parentName
   */
  var normalizeHot = function normalizeHot(parentName) {
    var hotName = getHotName(parentName);

    // No hotmodule exists, make and set one
    if (!System.has(hotName)) System.set(hotName, createHotModule(parentName));

    browser$1('systemjs-hmr:normalize')(parentName, '->', hotName);
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
    System.resolve = function (moduleName, parentName, parentAddress) {
      if (moduleName == '@hot') return Promise.resolve(normalizeHot(parentName));else return System.__proto__.resolve.apply(System, [moduleName, parentName, parentAddress]);
    }.bind(System);
  } else {
    System.normalize = function (moduleName, parentName, parentAddress) {
      if (moduleName == '@hot') return Promise.resolve(normalizeHot(parentName));else return System.__proto__.normalize.apply(System, [moduleName, parentName, parentAddress]);
    }.bind(System);
  }

  var resolve = is20 ? System.resolve : System.normalize;

  /**
   * Return normalized names of all modules that depend (directly or indirectly) on this module (including this module),
   * as well as the root dependencies
   * @param moduleName
   * @returns {{dependants: Array, entries: Array}}
   */
  var findDependants = function findDependants(moduleName) {

    // A queue of modules to explore next, starting with moduleName
    var next = [];

    // If the module exists in the trace, use it as starting point for discovery
    if (trace.has(moduleName)) next.push(moduleName);

    // A Set of all modules that depend on this one (includes moduleName)
    var dependents = new Set();

    // A Set of all modules that look like entries
    var entries = new Set();

    // While there are modules to explore (we might have already traversed some of them)
    while (next.length > 0) {

      // Get the first module to explore
      var dep = next.pop();

      // If we haven't already explored it
      if (!dependents.has(dep)) {
        // Add it to the list of explored modules
        dependents.add(dep);

        // Get a list of the modules that import it
        var directDependants = trace.getDependents(dep);

        // console.log('direct dependents', directDependants)

        // Add those to the list of modules to explore
        next.push.apply(next, toConsumableArray(directDependants));

        // Does this module look like a app entry
        if (directDependants.length == 0) entries.add(dep);
      }
    }

    return {
      // Array of normalized modules that depend on moduleName
      dependants: Array.from(dependents),
      // A guess at which modules are entries (can't accurately determine entries if circular references include them)
      entries: Array.from(entries)
    };
  };

  /**
   * Unload the module from the browser and delete from registry
   * @param moduleName
   */
  System.unload = function (moduleName) {
    var debug = browser$1('systemjs-hmr:reload');
    debug('unloading', moduleName);
    // Backwards comparability for old way of unloading
    if (System.has(moduleName)) {
      var module = System.get(moduleName);

      if (typeof module.__unload == 'function') module.__unload();
    }

    System.delete(moduleName);
  };

  /**
   * System.reload
   * Discover all modules that depend on moduleName, delete them, then re-import the app entries.
   */
  System.reload = function (moduleName) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    options = Object.assign({}, options);

    var debug = browser$1('systemjs-hmr:reload');

    debug('reloading', moduleName, 'with options', options);
    log$$1('reloading', moduleName);

    // Validate params
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) != 'object') throw new Error("When calling System.reload(_, meta), meta should be an object");

    if (!Array.isArray(options.entries)) {
      if (options.entries == undefined) options.entries = false;else throw new Error("When calling System.reload(_, meta), meta.entries should me an array of normalized module names");
    }

    /**
     * Allow people to pass in a set of modules to load after deleting dependants and before importing the entries.
     * For now this is mocked with an empty array.
     * @type {Array}
     */
    options.preload = [];

    return _.lock = _.lock.then(function () {
      debug('queued reload starting');
      return resolve(moduleName).then(function (name) {
        return findDependants(name);
      }).then(function (_ref) {
        var dependants = _ref.dependants,
            entries = _ref.entries;

        debug('found dependents', dependants, 'with entries', entries);
        // Delete all dependent modules

        if (entries.length == 0 && options.entries.length == 0) console.warn('systemjs-hmr: We couldn\'t detect any entries (entry points), this usually', 'means you have a circular dependency in your app code. This isn\'t a problem,', 'it just means that you need to specify {entries: [ ...entries ]} as the second argument', 'to System.reload. You can read more here: https://github.com/alexisvincent/systemjs-hmr#reload-api.', 'This is typically a library level concern, so if you are using a library that provides hot module replacement,', 'check how they handle entry points, or if they don\'t, open an issue with the library.');

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
          return resolve(dependent).then(function (dependent) {
            if (trace.hasDependency(dependent, normalizeHot(dependent)) || typeof System.get(dependent).__reload == 'function') {
              debug(dependent, 'imports @hot');
              System.set(getHotName(dependent), createHotModule(dependent));
            }

            // Unload the module from the browser and delete from registry
            return System.unload(dependent);
          });
        }))
        // .then(() => {
        //   return Promise.all(meta.preload.map(({
        //     name,
        //     source
        //   }) => System.load(name)))
        // })

        .then(function () {
          // If entries have been specified in meta, load those, otherwise load our best guess
          entries = options.entries || entries;
          log$$1('dependency tree purged, reimporting entries', entries);
          return Promise.all(entries.map(resolve)).then(function (entries) {
            return entries.map(function (entry) {
              return System.import(entry).catch(function (err) {
                return console.error(err);
              });
            });
          }).catch(function (e) {
            return console.error(e);
          });
        });
      });
    }).catch(function (err) {
      return console.log(err);
    });
  };
}

}());
