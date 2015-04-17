
var fs=require('fs')
var path="C:/1-Roman/Documents/8-test/test"
var tmpl='templates/tree.html'

var text=fs.readFileSync(tmpl,'utf8')
console.log(text)
