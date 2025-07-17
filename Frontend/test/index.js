const glob = require("glob");

console.log("launch /test/index.js:", __dirname)
const files = glob.sync("src/server#<{(||)}>#*.js")
files.forEach(file => {
  console.log("File: ", file)
  require('../' + file)
})
