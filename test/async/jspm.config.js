SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "app/": "src/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.21"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "app": {
      "main": "app.js",
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
    "npm:*.json"
  ],
  map: {
    "systemjs-hmr": "npm:systemjs-hmr@2.0.7",
    "systemjs-hot-reloader": "npm:systemjs-hot-reloader@1.1.0"
  },
  packages: {
    "npm:systemjs-hot-reloader@1.1.0": {
      "map": {
        "systemjs-hmr": "npm:systemjs-hmr@2.0.7"
      }
    }
  }
});
