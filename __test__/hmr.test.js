const SystemJS = require('systemjs')
const Promise = require('bluebird')
const fs = require('fs')

eval(fs.readFileSync('./jspm.config.js', 'utf8'))

SystemJS.import = function(m, parent) {
  if (typeof m == "array") {
    return Promise.resolve(m).map(mod => SystemJS.import(mod))
  }
}

test('react', (done) => {

  Promise.all([]).then(function(){

    done()
  })

})