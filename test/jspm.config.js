SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "local:": "jspm_packages/local/",
    "hmr-test/": "src/"
  },
  trace: true,
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.17"
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
    "local:*.json"
  ],
  map: {
    "systemjs-hmr": "local:systemjs-hmr@0.0.5"
  },
  packages: {}
});
