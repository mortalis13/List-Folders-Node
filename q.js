
var fs=require('fs')
var path="C:/1-Roman/Documents/8-test/test"

var text=""
var nl='\n'

function ScanDirectory(path){
  var text
  this.path=path
  this.text=[]
  
  this.fullScan(this.path,-1)
  if(!this.text.length){
    console.log("No Data!")
    return
  } 
    
  text=this.text.join('\n')
  console.log(text)
  
  var exportPath, ext, filename
  
  exportPath='export/text/';
  
  ext=".txt";
  name=this.getExportName(ext);
  
  fs.writeFileSync(exportPath+name,text)
}

ScanDirectory.prototype={
  
  fullScan: function(dir,level){
    var self=this,
    data,list,pad,count
    
    data=fs.readdirSync(dir)
    list=this.prepareData(data,dir)
    pad=this.getPadding(level)  
    
    count=list.length
    if(!count) return false
      
    list.forEach(function(value){
      var item=dir+'/'+value
      
      if(self.is_dir(item)){
        var currentDir='['+value+']'
        self.text.push(pad+currentDir)
        var res=self.fullScan(item,level+1)
      }
      else{
        var currentFile=value
        self.text.push(pad+currentFile)
      }
      
    })

    if(!count) return false
  },

  prepareData: function(data,dir){
    var self=this,
    folders=[], files=[], list
    
    data.forEach(function(value){
      var item=dir+'/'+value
      if (self.is_dir(item))
        folders.push(value)
      else if(self.filterFile(value))
        files.push(value)
    })
    
    list=this.getList(folders,files)
    return list;
  },
  
  getExportName: function(ext){
    var useCurrentDir,exportName, name
    
    useCurrentDir=false;
    exportName="no-name";
    
    useCurrentDir=true;
    
    if(useCurrentDir){
      var rx=new RegExp("\/[^\/]+$")
      exportName=rx.exec(this.path);
      exportName=exportName[0].substr(1);
    }
    
    name=exportName;
      debugger
    if(ext)
      name=exportName+ext;
    
    return name;
  },

  filterFile: function(value){
    return true
  },

  getList: function(folders,files){
    folders.sort()
    files.sort()
    var list=folders.concat(files)
    return list
  },

  is_dir: function(item){
    var stat=fs.statSync(item)
    var res=stat && stat.isDirectory()
    return res
  },

  getPadding: function(level){
    var pad,resPad
    pad='    '
    resPad=""
    
    for(var i=0;i<=level;i++)
      resPad+=pad
    return resPad
  },
}

// var sd=newS

new ScanDirectory(path)
// fullScan(path,-1)
