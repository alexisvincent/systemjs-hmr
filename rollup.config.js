import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
// import uglify from 'rollup-plugin-uglify'

export default {
  entry: './lib/index.js',
  dest: './dist/systemjs-hmr.js',
  format: 'iife',
  // sourceMap: 'inline',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs({
      namedExports: {
        'node_modules/immutable/dist/immutable.js': ['Map', 'Set'],
        'node_modules/imgraphjs/lib/imgraphjs.bundle.js': ['Graph']
      }
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    // (process.env.NODE_ENV === 'production' && uglify())
  ]
}