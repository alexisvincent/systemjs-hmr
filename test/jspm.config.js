SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "local:": "jspm_packages/local/",
    "github:": "jspm_packages/github/",
    "hmr-test/": "src/"
  },
  trace: true,
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.17",
      "jspm": "npm:jspm@beta",
      "events": "npm:jspm-nodelibs-events@0.2.0",
      "module": "npm:jspm-nodelibs-module@0.2.0",
      "os": "npm:jspm-nodelibs-os@0.2.0",
      "readline": "npm:jspm-nodelibs-readline@0.2.0",
      "crypto": "npm:jspm-nodelibs-crypto@0.2.0",
      "stream": "npm:jspm-nodelibs-stream@0.2.0",
      "assert": "npm:jspm-nodelibs-assert@0.2.0",
      "constants": "npm:jspm-nodelibs-constants@0.2.0",
      "child_process": "npm:jspm-nodelibs-child_process@0.2.0",
      "cluster": "npm:jspm-nodelibs-cluster@0.2.0",
      "buffer": "npm:jspm-nodelibs-buffer@0.2.1",
      "console": "npm:jspm-nodelibs-console@0.2.2",
      "http": "npm:jspm-nodelibs-http@0.2.0",
      "util": "npm:jspm-nodelibs-util@0.2.1",
      "dgram": "npm:jspm-nodelibs-dgram@0.2.0",
      "domain": "npm:jspm-nodelibs-domain@0.2.0",
      "repl": "npm:jspm-nodelibs-repl@0.2.0",
      "tty": "npm:jspm-nodelibs-tty@0.2.0",
      "timers": "npm:jspm-nodelibs-timers@0.2.0",
      "tls": "npm:jspm-nodelibs-tls@0.2.0",
      "vm": "npm:jspm-nodelibs-vm@0.2.0",
      "url": "npm:jspm-nodelibs-url@0.2.0",
      "dns": "npm:jspm-nodelibs-dns@0.2.0",
      "net": "npm:jspm-nodelibs-net@0.2.0",
      "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
      "https": "npm:jspm-nodelibs-https@0.2.1",
      "punycode": "npm:jspm-nodelibs-punycode@0.2.0",
      "zlib": "npm:jspm-nodelibs-zlib@0.2.2",
      "querystring": "npm:jspm-nodelibs-querystring@0.2.0",
      "ecc-jsbn": "npm:ecc-jsbn@0.1.1",
      "bcrypt-pbkdf": "npm:bcrypt-pbkdf@1.0.0",
      "jsbn": "npm:jsbn@0.1.0",
      "tweetnacl": "npm:tweetnacl@0.14.5",
      "jodid25519": "npm:jodid25519@1.0.2"
    },
    "packages": {
      "npm:jspm@beta": {
        "map": {
          "core-js": "npm:core-js@1.2.7",
          "chalk": "npm:chalk@1.1.3",
          "graceful-fs": "npm:graceful-fs@4.1.11",
          "jspm-github": "npm:jspm-github@0.14.11",
          "minimatch": "npm:minimatch@3.0.3",
          "jspm-registry": "npm:jspm-registry@0.4.3",
          "mkdirp": "npm:mkdirp@0.5.1",
          "ncp": "npm:ncp@2.0.0",
          "rimraf": "npm:rimraf@2.5.4",
          "sane": "npm:sane@1.5.0",
          "proper-lockfile": "npm:proper-lockfile@1.2.0",
          "liftoff": "npm:liftoff@2.3.0",
          "semver": "npm:semver@5.3.0",
          "jspm-npm": "npm:jspm-npm@0.30.1",
          "traceur": "npm:traceur@0.0.105",
          "glob": "npm:glob@6.0.4",
          "systemjs": "npm:systemjs@0.19.41",
          "bluebird": "npm:bluebird@3.4.7",
          "request": "npm:request@2.79.0",
          "uglify-js": "npm:uglify-js@2.7.5",
          "systemjs-builder": "npm:systemjs-builder@0.15.34"
        }
      },
      "npm:jspm-registry@0.4.3": {
        "map": {
          "graceful-fs": "npm:graceful-fs@4.1.11",
          "rimraf": "npm:rimraf@2.5.4",
          "semver": "npm:semver@4.3.6",
          "rsvp": "npm:rsvp@3.3.3"
        }
      },
      "npm:jspm-github@0.14.11": {
        "map": {
          "graceful-fs": "npm:graceful-fs@4.1.11",
          "mkdirp": "npm:mkdirp@0.5.1",
          "rimraf": "npm:rimraf@2.5.4",
          "semver": "npm:semver@5.3.0",
          "bluebird": "npm:bluebird@3.4.7",
          "request": "npm:request@2.79.0",
          "expand-tilde": "npm:expand-tilde@1.2.2",
          "tar-fs": "npm:tar-fs@1.15.0",
          "netrc": "npm:netrc@0.1.4",
          "which": "npm:which@1.2.12"
        }
      },
      "npm:proper-lockfile@1.2.0": {
        "map": {
          "graceful-fs": "npm:graceful-fs@4.1.11",
          "err-code": "npm:err-code@1.1.1",
          "retry": "npm:retry@0.10.1",
          "extend": "npm:extend@3.0.0"
        }
      },
      "npm:sane@1.5.0": {
        "map": {
          "minimatch": "npm:minimatch@3.0.3",
          "minimist": "npm:minimist@1.2.0",
          "exec-sh": "npm:exec-sh@0.2.0",
          "anymatch": "npm:anymatch@1.3.0",
          "walker": "npm:walker@1.0.7",
          "watch": "npm:watch@0.10.0",
          "fb-watchman": "npm:fb-watchman@1.9.0"
        }
      },
      "npm:jspm-npm@0.30.1": {
        "map": {
          "graceful-fs": "npm:graceful-fs@4.1.11",
          "mkdirp": "npm:mkdirp@0.5.1",
          "semver": "npm:semver@5.3.0",
          "traceur": "npm:traceur@0.0.105",
          "bluebird": "npm:bluebird@3.4.7",
          "request": "npm:request@2.79.0",
          "systemjs-builder": "npm:systemjs-builder@0.15.35",
          "readdirp": "npm:readdirp@2.1.0",
          "buffer-peek-stream": "npm:buffer-peek-stream@1.0.1",
          "tar-fs": "npm:tar-fs@1.15.0",
          "which": "npm:which@1.2.12"
        }
      },
      "npm:traceur@0.0.105": {
        "map": {
          "semver": "npm:semver@4.3.6",
          "glob": "npm:glob@5.0.15",
          "rsvp": "npm:rsvp@3.3.3",
          "source-map-support": "npm:source-map-support@0.2.10",
          "commander": "npm:commander@2.9.0"
        }
      },
      "npm:rimraf@2.5.4": {
        "map": {
          "glob": "npm:glob@7.1.1"
        }
      },
      "npm:glob@6.0.4": {
        "map": {
          "minimatch": "npm:minimatch@3.0.3",
          "inflight": "npm:inflight@1.0.6",
          "inherits": "npm:inherits@2.0.3",
          "path-is-absolute": "npm:path-is-absolute@1.0.1",
          "once": "npm:once@1.4.0"
        }
      },
      "npm:glob@5.0.15": {
        "map": {
          "minimatch": "npm:minimatch@3.0.3",
          "inflight": "npm:inflight@1.0.6",
          "inherits": "npm:inherits@2.0.3",
          "path-is-absolute": "npm:path-is-absolute@1.0.1",
          "once": "npm:once@1.4.0"
        }
      },
      "npm:glob@7.1.1": {
        "map": {
          "minimatch": "npm:minimatch@3.0.3",
          "inflight": "npm:inflight@1.0.6",
          "inherits": "npm:inherits@2.0.3",
          "path-is-absolute": "npm:path-is-absolute@1.0.1",
          "once": "npm:once@1.4.0",
          "fs.realpath": "npm:fs.realpath@1.0.0"
        }
      },
      "npm:systemjs-builder@0.15.35": {
        "map": {
          "systemjs": "npm:systemjs@0.19.43",
          "bluebird": "npm:bluebird@3.4.7",
          "glob": "npm:glob@7.1.1",
          "mkdirp": "npm:mkdirp@0.5.1",
          "traceur": "npm:traceur@0.0.105",
          "uglify-js": "npm:uglify-js@2.7.5",
          "babel-plugin-transform-cjs-system-wrapper": "npm:babel-plugin-transform-cjs-system-wrapper@0.3.0",
          "es6-template-strings": "npm:es6-template-strings@2.0.1",
          "rollup": "npm:rollup@0.36.4",
          "source-map": "npm:source-map@0.5.6",
          "babel-plugin-transform-es2015-modules-systemjs": "npm:babel-plugin-transform-es2015-modules-systemjs@6.22.0",
          "babel-plugin-transform-system-register": "npm:babel-plugin-transform-system-register@0.0.1",
          "babel-core": "npm:babel-core@6.22.1",
          "data-uri-to-buffer": "npm:data-uri-to-buffer@0.0.4",
          "babel-plugin-transform-global-system-wrapper": "npm:babel-plugin-transform-global-system-wrapper@0.0.1"
        }
      },
      "npm:systemjs-builder@0.15.34": {
        "map": {
          "bluebird": "npm:bluebird@3.4.7",
          "glob": "npm:glob@7.1.1",
          "mkdirp": "npm:mkdirp@0.5.1",
          "traceur": "npm:traceur@0.0.105",
          "uglify-js": "npm:uglify-js@2.7.5",
          "systemjs": "npm:systemjs@0.19.43",
          "babel-plugin-transform-cjs-system-wrapper": "npm:babel-plugin-transform-cjs-system-wrapper@0.2.1",
          "es6-template-strings": "npm:es6-template-strings@2.0.1",
          "rollup": "npm:rollup@0.36.4",
          "source-map": "npm:source-map@0.5.6",
          "babel-plugin-transform-es2015-modules-systemjs": "npm:babel-plugin-transform-es2015-modules-systemjs@6.22.0",
          "babel-plugin-transform-system-register": "npm:babel-plugin-transform-system-register@0.0.1",
          "babel-core": "npm:babel-core@6.22.1",
          "data-uri-to-buffer": "npm:data-uri-to-buffer@0.0.4",
          "babel-plugin-transform-global-system-wrapper": "npm:babel-plugin-transform-global-system-wrapper@0.0.1"
        }
      },
      "npm:liftoff@2.3.0": {
        "map": {
          "fined": "npm:fined@1.0.2",
          "rechoir": "npm:rechoir@0.6.2",
          "lodash.mapvalues": "npm:lodash.mapvalues@4.6.0",
          "findup-sync": "npm:findup-sync@0.4.3",
          "lodash.isplainobject": "npm:lodash.isplainobject@4.0.6",
          "extend": "npm:extend@3.0.0",
          "lodash.isstring": "npm:lodash.isstring@4.0.1",
          "resolve": "npm:resolve@1.2.0",
          "flagged-respawn": "npm:flagged-respawn@0.3.2"
        }
      },
      "npm:readdirp@2.1.0": {
        "map": {
          "graceful-fs": "npm:graceful-fs@4.1.11",
          "minimatch": "npm:minimatch@3.0.3",
          "set-immediate-shim": "npm:set-immediate-shim@1.0.1",
          "readable-stream": "npm:readable-stream@2.2.2"
        }
      },
      "npm:chalk@1.1.3": {
        "map": {
          "escape-string-regexp": "npm:escape-string-regexp@1.0.5",
          "supports-color": "npm:supports-color@2.0.0",
          "has-ansi": "npm:has-ansi@2.0.0",
          "strip-ansi": "npm:strip-ansi@3.0.1",
          "ansi-styles": "npm:ansi-styles@2.2.1"
        }
      },
      "npm:request@2.79.0": {
        "map": {
          "aws-sign2": "npm:aws-sign2@0.6.0",
          "http-signature": "npm:http-signature@1.1.1",
          "is-typedarray": "npm:is-typedarray@1.0.0",
          "stringstream": "npm:stringstream@0.0.5",
          "tunnel-agent": "npm:tunnel-agent@0.4.3",
          "tough-cookie": "npm:tough-cookie@2.3.2",
          "qs": "npm:qs@6.3.0",
          "mime-types": "npm:mime-types@2.1.14",
          "uuid": "npm:uuid@3.0.1",
          "extend": "npm:extend@3.0.0",
          "har-validator": "npm:har-validator@2.0.6",
          "aws4": "npm:aws4@1.5.0",
          "json-stringify-safe": "npm:json-stringify-safe@5.0.1",
          "hawk": "npm:hawk@3.1.3",
          "combined-stream": "npm:combined-stream@1.0.5",
          "isstream": "npm:isstream@0.1.2",
          "forever-agent": "npm:forever-agent@0.6.1",
          "form-data": "npm:form-data@2.1.2",
          "oauth-sign": "npm:oauth-sign@0.8.2",
          "caseless": "npm:caseless@0.11.0"
        }
      },
      "npm:minimatch@3.0.3": {
        "map": {
          "brace-expansion": "npm:brace-expansion@1.1.6"
        }
      },
      "npm:mkdirp@0.5.1": {
        "map": {
          "minimist": "npm:minimist@0.0.8"
        }
      },
      "npm:fined@1.0.2": {
        "map": {
          "expand-tilde": "npm:expand-tilde@1.2.2",
          "lodash.isplainobject": "npm:lodash.isplainobject@4.0.6",
          "lodash.assignwith": "npm:lodash.assignwith@4.2.0",
          "lodash.isempty": "npm:lodash.isempty@4.4.0",
          "parse-filepath": "npm:parse-filepath@1.0.1",
          "lodash.pick": "npm:lodash.pick@4.4.0",
          "lodash.isstring": "npm:lodash.isstring@4.0.1"
        }
      },
      "npm:jspm-nodelibs-stream@0.2.0": {
        "map": {
          "stream-browserify": "npm:stream-browserify@2.0.1"
        }
      },
      "npm:tar-fs@1.15.0": {
        "map": {
          "mkdirp": "npm:mkdirp@0.5.1",
          "pump": "npm:pump@1.0.2",
          "tar-stream": "npm:tar-stream@1.5.2"
        }
      },
      "npm:stream-browserify@2.0.1": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "readable-stream": "npm:readable-stream@2.2.2"
        }
      },
      "npm:systemjs@0.19.41": {
        "map": {
          "when": "npm:when@3.7.7"
        }
      },
      "npm:systemjs@0.19.43": {
        "map": {
          "when": "npm:when@3.7.7"
        }
      },
      "npm:brace-expansion@1.1.6": {
        "map": {
          "concat-map": "npm:concat-map@0.0.1",
          "balanced-match": "npm:balanced-match@0.4.2"
        }
      },
      "npm:inflight@1.0.6": {
        "map": {
          "once": "npm:once@1.4.0",
          "wrappy": "npm:wrappy@1.0.2"
        }
      },
      "npm:jspm-nodelibs-buffer@0.2.1": {
        "map": {
          "buffer": "npm:buffer@4.9.1"
        }
      },
      "npm:jspm-nodelibs-crypto@0.2.0": {
        "map": {
          "crypto-browserify": "npm:crypto-browserify@3.11.0"
        }
      },
      "npm:uglify-js@2.7.5": {
        "map": {
          "async": "npm:async@0.2.10",
          "yargs": "npm:yargs@3.10.0",
          "source-map": "npm:source-map@0.5.6",
          "uglify-to-browserify": "npm:uglify-to-browserify@1.0.2"
        }
      },
      "npm:crypto-browserify@3.11.0": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "public-encrypt": "npm:public-encrypt@4.0.0",
          "create-hmac": "npm:create-hmac@1.1.4",
          "randombytes": "npm:randombytes@2.0.3",
          "create-ecdh": "npm:create-ecdh@4.0.0",
          "browserify-cipher": "npm:browserify-cipher@1.0.0",
          "browserify-sign": "npm:browserify-sign@4.0.0",
          "diffie-hellman": "npm:diffie-hellman@5.0.2",
          "pbkdf2": "npm:pbkdf2@3.0.9",
          "create-hash": "npm:create-hash@1.1.2"
        }
      },
      "npm:rechoir@0.6.2": {
        "map": {
          "resolve": "npm:resolve@1.2.0"
        }
      },
      "npm:har-validator@2.0.6": {
        "map": {
          "chalk": "npm:chalk@1.1.3",
          "commander": "npm:commander@2.9.0",
          "is-my-json-valid": "npm:is-my-json-valid@2.15.0",
          "pinkie-promise": "npm:pinkie-promise@2.0.1"
        }
      },
      "npm:tough-cookie@2.3.2": {
        "map": {
          "punycode": "npm:punycode@1.4.1"
        }
      },
      "npm:expand-tilde@1.2.2": {
        "map": {
          "os-homedir": "npm:os-homedir@1.0.2"
        }
      },
      "npm:source-map-support@0.2.10": {
        "map": {
          "source-map": "npm:source-map@0.1.32"
        }
      },
      "npm:has-ansi@2.0.0": {
        "map": {
          "ansi-regex": "npm:ansi-regex@2.1.1"
        }
      },
      "npm:findup-sync@0.4.3": {
        "map": {
          "resolve-dir": "npm:resolve-dir@0.1.1",
          "is-glob": "npm:is-glob@2.0.1",
          "detect-file": "npm:detect-file@0.1.0",
          "micromatch": "npm:micromatch@2.3.11"
        }
      },
      "npm:jspm-nodelibs-os@0.2.0": {
        "map": {
          "os-browserify": "npm:os-browserify@0.2.1"
        }
      },
      "npm:exec-sh@0.2.0": {
        "map": {
          "merge": "npm:merge@1.2.0"
        }
      },
      "npm:rollup@0.36.4": {
        "map": {
          "source-map-support": "npm:source-map-support@0.4.10"
        }
      },
      "npm:resolve-dir@0.1.1": {
        "map": {
          "expand-tilde": "npm:expand-tilde@1.2.2",
          "global-modules": "npm:global-modules@0.2.3"
        }
      },
      "npm:strip-ansi@3.0.1": {
        "map": {
          "ansi-regex": "npm:ansi-regex@2.1.1"
        }
      },
      "npm:jspm-nodelibs-punycode@0.2.0": {
        "map": {
          "punycode-browserify": "npm:punycode@1.4.1"
        }
      },
      "npm:pump@1.0.2": {
        "map": {
          "once": "npm:once@1.4.0",
          "end-of-stream": "npm:end-of-stream@1.1.0"
        }
      },
      "npm:source-map-support@0.4.10": {
        "map": {
          "source-map": "npm:source-map@0.5.6"
        }
      },
      "npm:parse-filepath@1.0.1": {
        "map": {
          "map-cache": "npm:map-cache@0.2.2",
          "path-root": "npm:path-root@0.1.1",
          "is-absolute": "npm:is-absolute@0.2.6"
        }
      },
      "npm:babel-plugin-transform-cjs-system-wrapper@0.3.0": {
        "map": {
          "babel-template": "npm:babel-template@6.22.0"
        }
      },
      "npm:babel-plugin-transform-cjs-system-wrapper@0.2.1": {
        "map": {
          "babel-template": "npm:babel-template@6.22.0",
          "babel-plugin-transform-cjs-system-require": "npm:babel-plugin-transform-cjs-system-require@0.1.1"
        }
      },
      "npm:babel-plugin-transform-es2015-modules-systemjs@6.22.0": {
        "map": {
          "babel-template": "npm:babel-template@6.22.0",
          "babel-helper-hoist-variables": "npm:babel-helper-hoist-variables@6.22.0",
          "babel-runtime": "npm:babel-runtime@6.22.0"
        }
      },
      "npm:jspm-nodelibs-url@0.2.0": {
        "map": {
          "url-browserify": "npm:url@0.11.0"
        }
      },
      "npm:url@0.11.0": {
        "map": {
          "punycode": "npm:punycode@1.3.2",
          "querystring": "npm:querystring@0.2.0"
        }
      },
      "npm:readable-stream@2.2.2": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "isarray": "npm:isarray@1.0.0",
          "core-util-is": "npm:core-util-is@1.0.2",
          "string_decoder": "npm:string_decoder@0.10.31",
          "util-deprecate": "npm:util-deprecate@1.0.2",
          "buffer-shims": "npm:buffer-shims@1.0.0",
          "process-nextick-args": "npm:process-nextick-args@1.0.7"
        }
      },
      "npm:jspm-nodelibs-http@0.2.0": {
        "map": {
          "http-browserify": "npm:stream-http@2.6.3"
        }
      },
      "npm:stream-http@2.6.3": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "readable-stream": "npm:readable-stream@2.2.2",
          "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
          "builtin-status-codes": "npm:builtin-status-codes@3.0.0",
          "xtend": "npm:xtend@4.0.1"
        }
      },
      "npm:tar-stream@1.5.2": {
        "map": {
          "readable-stream": "npm:readable-stream@2.2.2",
          "end-of-stream": "npm:end-of-stream@1.1.0",
          "bl": "npm:bl@1.2.0",
          "xtend": "npm:xtend@4.0.1"
        }
      },
      "npm:anymatch@1.3.0": {
        "map": {
          "arrify": "npm:arrify@1.0.1",
          "micromatch": "npm:micromatch@2.3.11"
        }
      },
      "npm:micromatch@2.3.11": {
        "map": {
          "is-glob": "npm:is-glob@2.0.1",
          "arr-diff": "npm:arr-diff@2.0.0",
          "is-extglob": "npm:is-extglob@1.0.0",
          "extglob": "npm:extglob@0.3.2",
          "regex-cache": "npm:regex-cache@0.4.3",
          "parse-glob": "npm:parse-glob@3.0.4",
          "object.omit": "npm:object.omit@2.0.1",
          "normalize-path": "npm:normalize-path@2.0.1",
          "braces": "npm:braces@1.8.5",
          "expand-brackets": "npm:expand-brackets@0.1.5",
          "array-unique": "npm:array-unique@0.2.1",
          "kind-of": "npm:kind-of@3.1.0",
          "filename-regex": "npm:filename-regex@2.0.0"
        }
      },
      "npm:http-signature@1.1.1": {
        "map": {
          "jsprim": "npm:jsprim@1.3.1",
          "sshpk": "npm:sshpk@1.10.2",
          "assert-plus": "npm:assert-plus@0.2.0"
        }
      },
      "npm:mime-types@2.1.14": {
        "map": {
          "mime-db": "npm:mime-db@1.26.0"
        }
      },
      "npm:jspm-nodelibs-timers@0.2.0": {
        "map": {
          "timers-browserify": "npm:timers-browserify@1.4.2"
        }
      },
      "npm:form-data@2.1.2": {
        "map": {
          "combined-stream": "npm:combined-stream@1.0.5",
          "mime-types": "npm:mime-types@2.1.14",
          "asynckit": "npm:asynckit@0.4.0"
        }
      },
      "npm:buffer@4.9.1": {
        "map": {
          "ieee754": "npm:ieee754@1.1.8",
          "isarray": "npm:isarray@1.0.0",
          "base64-js": "npm:base64-js@1.2.0"
        }
      },
      "npm:create-hmac@1.1.4": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "create-hash": "npm:create-hash@1.1.2"
        }
      },
      "npm:yargs@3.10.0": {
        "map": {
          "window-size": "npm:window-size@0.1.0",
          "decamelize": "npm:decamelize@1.2.0",
          "camelcase": "npm:camelcase@1.2.1",
          "cliui": "npm:cliui@2.1.0"
        }
      },
      "npm:hawk@3.1.3": {
        "map": {
          "cryptiles": "npm:cryptiles@2.0.5",
          "hoek": "npm:hoek@2.16.3",
          "boom": "npm:boom@2.10.1",
          "sntp": "npm:sntp@1.0.9"
        }
      },
      "npm:cryptiles@2.0.5": {
        "map": {
          "boom": "npm:boom@2.10.1"
        }
      },
      "npm:boom@2.10.1": {
        "map": {
          "hoek": "npm:hoek@2.16.3"
        }
      },
      "npm:fb-watchman@1.9.0": {
        "map": {
          "bser": "npm:bser@1.0.2"
        }
      },
      "npm:end-of-stream@1.1.0": {
        "map": {
          "once": "npm:once@1.3.3"
        }
      },
      "npm:public-encrypt@4.0.0": {
        "map": {
          "randombytes": "npm:randombytes@2.0.3",
          "create-hash": "npm:create-hash@1.1.2",
          "bn.js": "npm:bn.js@4.11.6",
          "browserify-rsa": "npm:browserify-rsa@4.0.1",
          "parse-asn1": "npm:parse-asn1@5.0.0"
        }
      },
      "npm:jspm-nodelibs-domain@0.2.0": {
        "map": {
          "domain-browserify": "npm:domain-browser@1.1.7"
        }
      },
      "npm:bl@1.2.0": {
        "map": {
          "readable-stream": "npm:readable-stream@2.2.2"
        }
      },
      "npm:babel-core@6.22.1": {
        "map": {
          "minimatch": "npm:minimatch@3.0.3",
          "path-is-absolute": "npm:path-is-absolute@1.0.1",
          "source-map": "npm:source-map@0.5.6",
          "babel-template": "npm:babel-template@6.22.0",
          "babylon": "npm:babylon@6.15.0",
          "lodash": "npm:lodash@4.17.4",
          "babel-generator": "npm:babel-generator@6.22.0",
          "babel-helpers": "npm:babel-helpers@6.22.0",
          "babel-code-frame": "npm:babel-code-frame@6.22.0",
          "babel-runtime": "npm:babel-runtime@6.22.0",
          "babel-messages": "npm:babel-messages@6.22.0",
          "private": "npm:private@0.1.6",
          "convert-source-map": "npm:convert-source-map@1.3.0",
          "slash": "npm:slash@1.0.0",
          "json5": "npm:json5@0.5.1",
          "debug": "npm:debug@2.6.0",
          "babel-register": "npm:babel-register@6.22.0",
          "babel-traverse": "npm:babel-traverse@6.22.1",
          "babel-types": "npm:babel-types@6.22.0"
        }
      },
      "npm:sntp@1.0.9": {
        "map": {
          "hoek": "npm:hoek@2.16.3"
        }
      },
      "npm:source-map@0.1.32": {
        "map": {
          "amdefine": "npm:amdefine@1.0.1"
        }
      },
      "npm:jspm-nodelibs-string_decoder@0.2.0": {
        "map": {
          "string_decoder-browserify": "npm:string_decoder@0.10.31"
        }
      },
      "npm:detect-file@0.1.0": {
        "map": {
          "fs-exists-sync": "npm:fs-exists-sync@0.1.0"
        }
      },
      "npm:es6-template-strings@2.0.1": {
        "map": {
          "esniff": "npm:esniff@1.1.0",
          "es5-ext": "npm:es5-ext@0.10.12"
        }
      },
      "npm:commander@2.9.0": {
        "map": {
          "graceful-readlink": "npm:graceful-readlink@1.0.1"
        }
      },
      "npm:walker@1.0.7": {
        "map": {
          "makeerror": "npm:makeerror@1.0.11"
        }
      },
      "npm:babel-template@6.22.0": {
        "map": {
          "babylon": "npm:babylon@6.15.0",
          "lodash": "npm:lodash@4.17.4",
          "babel-runtime": "npm:babel-runtime@6.22.0",
          "babel-traverse": "npm:babel-traverse@6.22.1",
          "babel-types": "npm:babel-types@6.22.0"
        }
      },
      "npm:sshpk@1.10.2": {
        "map": {
          "assert-plus": "npm:assert-plus@1.0.0",
          "dashdash": "npm:dashdash@1.14.1",
          "getpass": "npm:getpass@0.1.6",
          "asn1": "npm:asn1@0.2.3"
        }
      },
      "npm:babel-plugin-transform-global-system-wrapper@0.0.1": {
        "map": {
          "babel-template": "npm:babel-template@6.22.0"
        }
      },
      "npm:is-my-json-valid@2.15.0": {
        "map": {
          "generate-object-property": "npm:generate-object-property@1.2.0",
          "generate-function": "npm:generate-function@2.0.0",
          "jsonpointer": "npm:jsonpointer@4.0.1",
          "xtend": "npm:xtend@4.0.1"
        }
      },
      "npm:dashdash@1.14.1": {
        "map": {
          "assert-plus": "npm:assert-plus@1.0.0"
        }
      },
      "npm:getpass@0.1.6": {
        "map": {
          "assert-plus": "npm:assert-plus@1.0.0"
        }
      },
      "npm:ecc-jsbn@0.1.1": {
        "map": {
          "jsbn": "npm:jsbn@0.1.0"
        }
      },
      "npm:browserify-sign@4.0.0": {
        "map": {
          "create-hmac": "npm:create-hmac@1.1.4",
          "inherits": "npm:inherits@2.0.3",
          "create-hash": "npm:create-hash@1.1.2",
          "bn.js": "npm:bn.js@4.11.6",
          "browserify-rsa": "npm:browserify-rsa@4.0.1",
          "parse-asn1": "npm:parse-asn1@5.0.0",
          "elliptic": "npm:elliptic@6.3.2"
        }
      },
      "npm:bcrypt-pbkdf@1.0.0": {
        "map": {
          "tweetnacl": "npm:tweetnacl@0.14.5"
        }
      },
      "npm:jodid25519@1.0.2": {
        "map": {
          "jsbn": "npm:jsbn@0.1.0"
        }
      },
      "npm:combined-stream@1.0.5": {
        "map": {
          "delayed-stream": "npm:delayed-stream@1.0.0"
        }
      },
      "npm:is-glob@2.0.1": {
        "map": {
          "is-extglob": "npm:is-extglob@1.0.0"
        }
      },
      "npm:babel-generator@6.22.0": {
        "map": {
          "lodash": "npm:lodash@4.17.4",
          "source-map": "npm:source-map@0.5.6",
          "babel-runtime": "npm:babel-runtime@6.22.0",
          "babel-messages": "npm:babel-messages@6.22.0",
          "babel-types": "npm:babel-types@6.22.0",
          "jsesc": "npm:jsesc@1.3.0",
          "detect-indent": "npm:detect-indent@4.0.0"
        }
      },
      "npm:babel-helpers@6.22.0": {
        "map": {
          "babel-template": "npm:babel-template@6.22.0",
          "babel-runtime": "npm:babel-runtime@6.22.0"
        }
      },
      "npm:babel-helper-hoist-variables@6.22.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.22.0",
          "babel-types": "npm:babel-types@6.22.0"
        }
      },
      "npm:babel-code-frame@6.22.0": {
        "map": {
          "chalk": "npm:chalk@1.1.3",
          "esutils": "npm:esutils@2.0.2",
          "js-tokens": "npm:js-tokens@3.0.0"
        }
      },
      "npm:babel-runtime@6.22.0": {
        "map": {
          "core-js": "npm:core-js@2.4.1",
          "regenerator-runtime": "npm:regenerator-runtime@0.10.1"
        }
      },
      "npm:babel-messages@6.22.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.22.0"
        }
      },
      "npm:timers-browserify@1.4.2": {
        "map": {
          "process": "npm:process@0.11.9"
        }
      },
      "npm:diffie-hellman@5.0.2": {
        "map": {
          "randombytes": "npm:randombytes@2.0.3",
          "bn.js": "npm:bn.js@4.11.6",
          "miller-rabin": "npm:miller-rabin@4.0.0"
        }
      },
      "npm:generate-object-property@1.2.0": {
        "map": {
          "is-property": "npm:is-property@1.0.2"
        }
      },
      "npm:extglob@0.3.2": {
        "map": {
          "is-extglob": "npm:is-extglob@1.0.0"
        }
      },
      "npm:parse-glob@3.0.4": {
        "map": {
          "is-extglob": "npm:is-extglob@1.0.0",
          "is-glob": "npm:is-glob@2.0.1",
          "glob-base": "npm:glob-base@0.3.0",
          "is-dotfile": "npm:is-dotfile@1.0.2"
        }
      },
      "npm:pbkdf2@3.0.9": {
        "map": {
          "create-hmac": "npm:create-hmac@1.1.4"
        }
      },
      "npm:jsprim@1.3.1": {
        "map": {
          "json-schema": "npm:json-schema@0.2.3",
          "extsprintf": "npm:extsprintf@1.0.2",
          "verror": "npm:verror@1.3.6"
        }
      },
      "npm:once@1.4.0": {
        "map": {
          "wrappy": "npm:wrappy@1.0.2"
        }
      },
      "npm:once@1.3.3": {
        "map": {
          "wrappy": "npm:wrappy@1.0.2"
        }
      },
      "npm:create-hash@1.1.2": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "cipher-base": "npm:cipher-base@1.0.3",
          "sha.js": "npm:sha.js@2.4.8",
          "ripemd160": "npm:ripemd160@1.0.1"
        }
      },
      "npm:browserify-cipher@1.0.0": {
        "map": {
          "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
          "browserify-aes": "npm:browserify-aes@1.0.6",
          "browserify-des": "npm:browserify-des@1.0.0"
        }
      },
      "npm:evp_bytestokey@1.0.0": {
        "map": {
          "create-hash": "npm:create-hash@1.1.2"
        }
      },
      "npm:browserify-aes@1.0.6": {
        "map": {
          "create-hash": "npm:create-hash@1.1.2",
          "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
          "inherits": "npm:inherits@2.0.3",
          "cipher-base": "npm:cipher-base@1.0.3",
          "buffer-xor": "npm:buffer-xor@1.0.3"
        }
      },
      "npm:arr-diff@2.0.0": {
        "map": {
          "arr-flatten": "npm:arr-flatten@1.0.1"
        }
      },
      "npm:babel-register@6.22.0": {
        "map": {
          "core-js": "npm:core-js@2.4.1",
          "lodash": "npm:lodash@4.17.4",
          "mkdirp": "npm:mkdirp@0.5.1",
          "source-map-support": "npm:source-map-support@0.4.10",
          "babel-core": "npm:babel-core@6.22.1",
          "babel-runtime": "npm:babel-runtime@6.22.0",
          "home-or-tmp": "npm:home-or-tmp@2.0.0"
        }
      },
      "npm:esniff@1.1.0": {
        "map": {
          "d": "npm:d@1.0.0",
          "es5-ext": "npm:es5-ext@0.10.12"
        }
      },
      "npm:create-ecdh@4.0.0": {
        "map": {
          "bn.js": "npm:bn.js@4.11.6",
          "elliptic": "npm:elliptic@6.3.2"
        }
      },
      "npm:babel-traverse@6.22.1": {
        "map": {
          "babylon": "npm:babylon@6.15.0",
          "debug": "npm:debug@2.6.0",
          "lodash": "npm:lodash@4.17.4",
          "babel-code-frame": "npm:babel-code-frame@6.22.0",
          "babel-messages": "npm:babel-messages@6.22.0",
          "babel-runtime": "npm:babel-runtime@6.22.0",
          "babel-types": "npm:babel-types@6.22.0",
          "globals": "npm:globals@9.14.0",
          "invariant": "npm:invariant@2.2.2"
        }
      },
      "npm:babel-types@6.22.0": {
        "map": {
          "esutils": "npm:esutils@2.0.2",
          "lodash": "npm:lodash@4.17.4",
          "babel-runtime": "npm:babel-runtime@6.22.0",
          "to-fast-properties": "npm:to-fast-properties@1.0.2"
        }
      },
      "npm:jspm-nodelibs-zlib@0.2.2": {
        "map": {
          "browserify-zlib": "npm:browserify-zlib@0.1.4"
        }
      },
      "npm:browserify-des@1.0.0": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "cipher-base": "npm:cipher-base@1.0.3",
          "des.js": "npm:des.js@1.0.0"
        }
      },
      "npm:verror@1.3.6": {
        "map": {
          "extsprintf": "npm:extsprintf@1.0.2"
        }
      },
      "npm:glob-base@0.3.0": {
        "map": {
          "is-glob": "npm:is-glob@2.0.1",
          "glob-parent": "npm:glob-parent@2.0.0"
        }
      },
      "npm:browserify-zlib@0.1.4": {
        "map": {
          "readable-stream": "npm:readable-stream@2.2.2",
          "pako": "npm:pako@0.2.9"
        }
      },
      "npm:pinkie-promise@2.0.1": {
        "map": {
          "pinkie": "npm:pinkie@2.0.4"
        }
      },
      "npm:cliui@2.1.0": {
        "map": {
          "center-align": "npm:center-align@0.1.3",
          "right-align": "npm:right-align@0.1.3",
          "wordwrap": "npm:wordwrap@0.0.2"
        }
      },
      "npm:bser@1.0.2": {
        "map": {
          "node-int64": "npm:node-int64@0.4.0"
        }
      },
      "npm:which@1.2.12": {
        "map": {
          "isexe": "npm:isexe@1.1.2"
        }
      },
      "npm:makeerror@1.0.11": {
        "map": {
          "tmpl": "npm:tmpl@1.0.4"
        }
      },
      "npm:parse-asn1@5.0.0": {
        "map": {
          "browserify-aes": "npm:browserify-aes@1.0.6",
          "create-hash": "npm:create-hash@1.1.2",
          "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
          "pbkdf2": "npm:pbkdf2@3.0.9",
          "asn1.js": "npm:asn1.js@4.9.1"
        }
      },
      "npm:browserify-rsa@4.0.1": {
        "map": {
          "bn.js": "npm:bn.js@4.11.6",
          "randombytes": "npm:randombytes@2.0.3"
        }
      },
      "npm:miller-rabin@4.0.0": {
        "map": {
          "bn.js": "npm:bn.js@4.11.6",
          "brorand": "npm:brorand@1.0.6"
        }
      },
      "npm:d@1.0.0": {
        "map": {
          "es5-ext": "npm:es5-ext@0.10.12"
        }
      },
      "npm:cipher-base@1.0.3": {
        "map": {
          "inherits": "npm:inherits@2.0.3"
        }
      },
      "npm:sha.js@2.4.8": {
        "map": {
          "inherits": "npm:inherits@2.0.3"
        }
      },
      "npm:home-or-tmp@2.0.0": {
        "map": {
          "os-homedir": "npm:os-homedir@1.0.2",
          "os-tmpdir": "npm:os-tmpdir@1.0.2"
        }
      },
      "npm:global-modules@0.2.3": {
        "map": {
          "global-prefix": "npm:global-prefix@0.1.5",
          "is-windows": "npm:is-windows@0.2.0"
        }
      },
      "npm:is-absolute@0.2.6": {
        "map": {
          "is-windows": "npm:is-windows@0.2.0",
          "is-relative": "npm:is-relative@0.2.1"
        }
      },
      "npm:global-prefix@0.1.5": {
        "map": {
          "which": "npm:which@1.2.12",
          "is-windows": "npm:is-windows@0.2.0",
          "homedir-polyfill": "npm:homedir-polyfill@1.0.1",
          "ini": "npm:ini@1.3.4"
        }
      },
      "npm:path-root@0.1.1": {
        "map": {
          "path-root-regex": "npm:path-root-regex@0.1.2"
        }
      },
      "npm:center-align@0.1.3": {
        "map": {
          "align-text": "npm:align-text@0.1.4",
          "lazy-cache": "npm:lazy-cache@1.0.4"
        }
      },
      "npm:right-align@0.1.3": {
        "map": {
          "align-text": "npm:align-text@0.1.4"
        }
      },
      "npm:align-text@0.1.4": {
        "map": {
          "kind-of": "npm:kind-of@3.1.0",
          "longest": "npm:longest@1.0.1",
          "repeat-string": "npm:repeat-string@1.6.1"
        }
      },
      "npm:asn1.js@4.9.1": {
        "map": {
          "bn.js": "npm:bn.js@4.11.6",
          "inherits": "npm:inherits@2.0.3",
          "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
        }
      },
      "npm:regex-cache@0.4.3": {
        "map": {
          "is-primitive": "npm:is-primitive@2.0.0",
          "is-equal-shallow": "npm:is-equal-shallow@0.1.3"
        }
      },
      "npm:es5-ext@0.10.12": {
        "map": {
          "es6-symbol": "npm:es6-symbol@3.1.0",
          "es6-iterator": "npm:es6-iterator@2.0.0"
        }
      },
      "npm:braces@1.8.5": {
        "map": {
          "expand-range": "npm:expand-range@1.8.2",
          "repeat-element": "npm:repeat-element@1.1.2",
          "preserve": "npm:preserve@0.2.0"
        }
      },
      "npm:expand-brackets@0.1.5": {
        "map": {
          "is-posix-bracket": "npm:is-posix-bracket@0.1.1"
        }
      },
      "npm:es6-symbol@3.1.0": {
        "map": {
          "d": "npm:d@0.1.1",
          "es5-ext": "npm:es5-ext@0.10.12"
        }
      },
      "npm:glob-parent@2.0.0": {
        "map": {
          "is-glob": "npm:is-glob@2.0.1"
        }
      },
      "npm:des.js@1.0.0": {
        "map": {
          "inherits": "npm:inherits@2.0.3",
          "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
        }
      },
      "npm:elliptic@6.3.2": {
        "map": {
          "bn.js": "npm:bn.js@4.11.6",
          "brorand": "npm:brorand@1.0.6",
          "inherits": "npm:inherits@2.0.3",
          "hash.js": "npm:hash.js@1.0.3"
        }
      },
      "npm:d@0.1.1": {
        "map": {
          "es5-ext": "npm:es5-ext@0.10.12"
        }
      },
      "npm:invariant@2.2.2": {
        "map": {
          "loose-envify": "npm:loose-envify@1.3.1"
        }
      },
      "npm:loose-envify@1.3.1": {
        "map": {
          "js-tokens": "npm:js-tokens@3.0.0"
        }
      },
      "npm:kind-of@3.1.0": {
        "map": {
          "is-buffer": "npm:is-buffer@1.1.4"
        }
      },
      "npm:object.omit@2.0.1": {
        "map": {
          "is-extendable": "npm:is-extendable@0.1.1",
          "for-own": "npm:for-own@0.1.4"
        }
      },
      "npm:es6-iterator@2.0.0": {
        "map": {
          "d": "npm:d@0.1.1",
          "es5-ext": "npm:es5-ext@0.10.12",
          "es6-symbol": "npm:es6-symbol@3.1.0"
        }
      },
      "npm:detect-indent@4.0.0": {
        "map": {
          "repeating": "npm:repeating@2.0.1"
        }
      },
      "npm:expand-range@1.8.2": {
        "map": {
          "fill-range": "npm:fill-range@2.2.3"
        }
      },
      "npm:fill-range@2.2.3": {
        "map": {
          "repeat-element": "npm:repeat-element@1.1.2",
          "repeat-string": "npm:repeat-string@1.6.1",
          "is-number": "npm:is-number@2.1.0",
          "isobject": "npm:isobject@2.1.0",
          "randomatic": "npm:randomatic@1.1.6"
        }
      },
      "npm:is-relative@0.2.1": {
        "map": {
          "is-unc-path": "npm:is-unc-path@0.1.2"
        }
      },
      "npm:hash.js@1.0.3": {
        "map": {
          "inherits": "npm:inherits@2.0.3"
        }
      },
      "npm:is-equal-shallow@0.1.3": {
        "map": {
          "is-primitive": "npm:is-primitive@2.0.0"
        }
      },
      "npm:repeating@2.0.1": {
        "map": {
          "is-finite": "npm:is-finite@1.0.2"
        }
      },
      "npm:is-number@2.1.0": {
        "map": {
          "kind-of": "npm:kind-of@3.1.0"
        }
      },
      "npm:isobject@2.1.0": {
        "map": {
          "isarray": "npm:isarray@1.0.0"
        }
      },
      "npm:randomatic@1.1.6": {
        "map": {
          "is-number": "npm:is-number@2.1.0",
          "kind-of": "npm:kind-of@3.1.0"
        }
      },
      "npm:is-unc-path@0.1.2": {
        "map": {
          "unc-path-regex": "npm:unc-path-regex@0.1.2"
        }
      },
      "npm:for-own@0.1.4": {
        "map": {
          "for-in": "npm:for-in@0.1.6"
        }
      },
      "npm:is-finite@1.0.2": {
        "map": {
          "number-is-nan": "npm:number-is-nan@1.0.1"
        }
      },
      "npm:homedir-polyfill@1.0.1": {
        "map": {
          "parse-passwd": "npm:parse-passwd@1.0.0"
        }
      }
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "hmr-test": {
      "main": "hmr-test.js",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "local:*.json",
    "github:*/*.json"
  ],
  map: {
    "systemjs-hmr": "npm:systemjs-hmr@0.1.7",
    "socket.io-client": "github:socketio/socket.io-client@1.7.2",
    "fs": "npm:jspm-nodelibs-fs@0.2.0",
    "path": "npm:jspm-nodelibs-path@0.2.1",
    "process": "npm:jspm-nodelibs-process@0.2.0",
    "systemjs-tools": "npm:systemjs-tools@2.0.0-beta.11",
    "debug": "npm:debug@2.6.0"
  },
  packages: {
    "npm:systemjs-tools@2.0.0-beta.11": {
      "map": {
        "deepmerge": "npm:deepmerge@1.3.1"
      }
    },
    "npm:debug@2.6.0": {
      "map": {
        "ms": "npm:ms@0.7.2"
      }
    },
    "npm:systemjs-hmr@0.1.7": {
      "map": {
        "debug": "npm:debug@2.6.0"
      }
    }
  }
});
