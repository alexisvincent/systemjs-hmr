// import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'

export default {
  entry: './dist/index.js',
  dest: './dist/bundle.umd.js',
  format: 'iife',
  sourceMap: true,
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
    // babel({
    //   exclude: 'node_modules/**',
    //   runtimeHelpers: true
    // }),
    uglify()
  ]
}
