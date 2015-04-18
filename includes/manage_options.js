
var db=require('./database.js')

exports.addOption=function(post){
  var name, value
  name=post.name
  value=post.value
  db.updateOption(name,value)
  return true
}

exports.removeOption=function(post){
  var name, value
  name=post.name
  db.removeOption(name)
  return true
}

exports.loadOption=function(post,cb){
  var name, res
  name=post.name
  res=db.getOption(name,cb)
  return res
}
