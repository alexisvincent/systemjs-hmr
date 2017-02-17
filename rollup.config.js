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
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    // (process.env.NODE_ENV === 'production' && uglify())
  ]
}