/**
 * Created by 18680666@sun.ac.za on 2017/02/27.
 */
const Promise = 'bluebird'

module.exports = {
  import: (sys, arr) => Promise.all(arr.map(dep => sys.import(dep)))

}