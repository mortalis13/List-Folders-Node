
var fs=require('fs')
var path="C:/1-Roman/Documents/8-test/test"

var text=""
var nl='\n'

var ScanDirectory={
  
}

function fullScan(dir,level){
  var data=fs.readdirSync(dir)
  var list=prepareData(data,dir)
  var pad=getPadding(level)  
  
  var count=list.length
  if(!count) return false
    
  list.forEach(function(value){
    var item=dir+'/'+value
    var stat=fs.statSync(item)
    
    if(stat.isDirectory()){
      var currentDir='['+value+']'
      text+=pad+currentDir+nl
      var res=fullScan(item,level+1)
    }
    else{
      var currentFile=value
      text+=pad+currentFile+nl
    }
    
  })  

  if(!count) return false
}

function prepareData(data,dir){
  var folders=[], files=[], list
  
  data.forEach(function(value){
    var item=dir+'/'+value
    if (is_dir(item))
      folders.push(value)
    else if(filterFile(value))
      files.push(value)
  })
  
  list=getList(folders,files)
  return list;
}

function filterFile(value){
  return true
}

function getList(folders,files){
  folders.sort()
  files.sort()
  var list=folders.concat(files)
  return list
}

function is_dir(item){
  var stat=fs.statSync(item)
  var res=stat && stat.isDirectory()
  return res
}

function getPadding(level){
  var pad,resPad
  pad='    '
  resPad=""
  
  for(var i=0;i<=level;i++)
    resPad+=pad
  return resPad
}

fullScan(path,-1)

if(!text) console.log("No Data!")
console.log(text)
