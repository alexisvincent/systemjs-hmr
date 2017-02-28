/**
 * Created by 18680666@sun.ac.za on 2017/02/27.
 */
const jest = require("gulp-jest-jspm");
const fs = require("fs")

const config = jest.getJestConfig(__dirname, {
  sjsConfigFile: './jspm.config.js',
  jestConfig: "jest.json"
});

fs.writeFileSync('./jest.gen.json', JSON.stringify(config))

