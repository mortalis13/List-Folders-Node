
var fs=require('fs')
var path="C:/1-Roman/Documents/8-test/test"

exports.text=""
var nl='\n'

exports.ScanDirectory=function(post){
  var path, filterExt, excludeExt, filterDir
  
  this.path=this.formatPath(post.path)
  this.filterExt=this.getFilters(post.filter_ext)
  this.excludeExt=this.getFilters(post.exclude_ext)
  this.filterDir=this.getFilters(post.filter_dir)
  
  console.log('filterExt: '+this.filterExt+'\n')
  console.log('excludeExt: '+this.excludeExt+'\n')
  console.log('filterDir: '+this.filterDir+'\n')
  
  this.doExportText=post.export_text
  this.doExportMarkup=post.export_markup
  this.doExportTree=post.export_tree
  
  this.exportName=this.trim(post.export_name)
  // this.exportName=post.export_name && post.export_name.trim()
  this.iconsPath="./lib/images/"
  
  this.text=[]
  this.markup=[]
  
  this.exts=[
    "chm",
    "css",
    "djvu",
    "dll",
    "doc",
    "exe",
    "html",
    "iso",
    "js",
    "msi",
    "pdf",
    "php",
    "psd",
    "rar",
    "txt",
    "xls",
    "xml",
    "xpi",
    "zip",
  ]

  this.imageExts=[
    "png",
    "gif",
    "jpg",
    "jpeg",
    "tiff",
    "bmp",
  ]

  this.musicExts=[
    "mp3",
    "wav",
    "ogg",
    "alac",
    "flac",
  ]

  this.videoExts=[
    "mkv",
    "flv",
    "vob",
    "avi",
    "wmv",
    "mov",
    "mp4",
    "mpg",
    "mpeg",
    "3gp",
  ]
  
  this.processData()
}

exports.ScanDirectory.prototype={
  
  processData: function(){
    var text,json
    
    json=this.fullScan(this.path,-1)
    this.json=JSON.stringify(json)
    
    if(!this.text.length){
      console.log("No Data!")
      return
    } 
    
    text=this.text.join('\n')
    exports.text=this.wrapText(text)
    
    if(this.doExportText)
      this.exportText(text)
    if(this.doExportMarkup)
      this.exportMarkup()
    if(this.doExportTree)
      this.exportTree()
  },
    
  fullScan: function(dir,level){
    var self=this,
    data,list,pad,count,passed
    var json=[]
    
    data=fs.readdirSync(dir)
    list=this.prepareData(data,dir)
    pad=this.getPadding(level)  
    
    count=list.length
    // if(!count) return false
      
    list.forEach(function(value){
      var item=dir+'/'+value
      
      if(self.is_dir(item)){
        passed=true;
        debugger
        if(self.filterDir && level==-1){
          passed=self.filterDirectory(value);         // filter directories
        }
        if(!passed) return
        
        var currentDir='['+value+']'
        self.markup.push(pad+self.wrapDir(currentDir))
        self.text.push(pad+currentDir)
        var res=self.fullScan(item,level+1)
        
        json.push({
          text: self.fixEncoding(value),                   
          children: res
        })
      }
      else{
        var currentFile=value
        self.markup.push(pad+self.wrapFile(currentFile))
        self.text.push(pad+currentFile)
        
        json.push({
          text: self.fixEncoding(value),            
          icon: self.getIcon(value)
        })
      }
      
    })

    // if(!count) return false
    return json
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
  
  getList: function(folders,files){
    folders.sort()
    files.sort()
    var list=folders.concat(files)
    return list
  },
  
// --------------------------------------------- helpers ---------------------------------------------

  formatPath: function(path){
    path=path.replace(/\\/g,"/")
    path=path.trim()
    
    if(path.substr(-1)=="/")
      path=path.substr(0,path.length-1)
    
    return path
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
  
  fixEncoding: function(value){
    return value
  },
  
  replaceTemplate: function(tmpl, replacement, text){
    var text=text.replace(tmpl, replacement)
    return text
  },
  
  getIcon: function(file){
    var ext, icon, path, iconExt, useDefault 
    
    ext="";
    icon="jstree-file";
    path=this.iconsPath;
    iconExt=".png";
    
    var rx=new RegExp("\\.[\\w]+$")
    ext=rx.exec(file)
    if(!ext.length) return icon;
    ext=ext[0].substr(1);
    
    useDefault=true;
    
    if(useDefault){
      for(var i in this.exts){
        var item=this.exts[i]
        if(ext==item){
          icon=path+item+iconExt;
          useDefault=false;
          break;
        }
      }
    }
    
    if(useDefault){
      for(var i in this.imageExts){
        var item=this.imageExts[i]
        if(ext==item){
          icon=path+"image"+iconExt;
          useDefault=false;
          break;
        }
      }
    }
    
    if(useDefault){
      for(var i in this.musicExts){
        var item=this.musicExts[i]
        if(ext==item){
          icon=path+"music"+iconExt;
          useDefault=false;
          break;
        }
      }
    }
    
    if(useDefault){
      for(var i in this.videoExts){
        var item=this.videoExts[i]
        if(ext==item){
          icon=path+"video"+iconExt;
          useDefault=false;
          break;
        }
      }
    }
    
    return icon;
  },
  
  getFilters: function(filter){
    filter=filter && filter.trim();
    
    if(filter){
      filter=filter.split("\n");
      for(var i in filter){
        filter[i]=filter[i].trim()
      }
    }
    return filter;
  },
  
  filterFile: function(value){
    if(this.excludeExt){
      for(var i in this.excludeExt){
        var ext=this.excludeExt[i]
        var rx=new RegExp("\\."+ext+"$")
        if(rx.test(value))
          return false
      }
      return true;
    }
    
    if(!this.filterExt) return true;
    for(var i in this.filterExt){
      var ext=this.filterExt[i]
      var rx=new RegExp("\\."+ext+"$")
      if(rx.test(value))
        return true
    }
    return false;
  },
  
  filterDirectory: function(dir){
    for(var i in this.filterDir) {
      var filter=this.filterDir[i]
      if(filter==dir)
        return true;
    }
    return false;
  },
  
  getFiltersText: function(){
    var filterExt="", filterDir="", filters
    
    if(this.filterExt){
      filterExt=this.filterExt.join(",");
    }
    if(this.filterDir){
      filterDir=this.filterDir.join(",");
    }
    
    filters='Files ['+filterExt+']';
    filters+=', Directories ['+filterDir+']';
    
    return filters;
  },
  
  trim: function(value){
    return value && value.trim()
  },
  
// --------------------------------------------- wrappers ---------------------------------------------
  
  wrapDir: function(dir){
    return '<span class="directory">'+dir+'</span>';
  },
  
  wrapFile: function(file){
    return '<span class="file">'+file+'</span>';
  },
  
  wrapText: function(text){
    return '<pre>'+text+'</pre>';
  },
  
  wrapMarkup: function(markup){
    markup='<pre>'+nl+markup+nl+'</pre>';
    markup=this.wrapDocument(markup);
    return markup;
  },
  
  wrapDocument: function(markup){
    return '<meta charset="utf-8">'+nl+markup
  },
  
// --------------------------------------------- exports ---------------------------------------------
  
  exportText: function(text){
    var exportPath, ext, filename
    exportPath='export/text/';
    ext=".txt";
    name=this.getExportName(ext);
    fs.writeFileSync(exportPath+name,text)
  },
  
  exportMarkup: function(){
    var exportPath, ext, filename, markup
    markup=this.markup.join('\n')
    markup=this.wrapMarkup(markup)
    exportPath='export/markup/';
    ext=".html";
    name=this.getExportName(ext);
    fs.writeFileSync(exportPath+name,markup)
  },
  
  exportTree: function(){
    var exportPath, treeName, tmpl, doc, filters
    var json, jsonFolder, jsonPath,
    exportDoc, exportJSON
    
    json=this.json
    
    treeName=this.getExportName();
    tmpl='templates/tree.html';
    
    exportPath="export/tree/";
    jsonFolder="json/";
    jsonPath=exportPath+jsonFolder;
    
    exportDoc=treeName+".html";
    exportJSON=treeName+".json";
    
    doc=fs.readFileSync(tmpl,'utf8')
    
    doc=this.replaceTemplate("_jsonPath_", jsonFolder+exportJSON, doc);
    doc=this.replaceTemplate("_Title_", 'Directory: '+treeName, doc);
    doc=this.replaceTemplate("_FolderPath_", 'Directory: '+this.path, doc);
    
    filters=this.getFiltersText();
    doc=this.replaceTemplate("_Filters_", "Filters: "+filters, doc);
    
    fs.writeFileSync(exportPath+exportDoc,doc)
    fs.writeFileSync(jsonPath+exportJSON,json)
  },
  
  getExportName: function(ext){
    var useCurrentDir,exportName,name
    
    useCurrentDir=true;
    exportName="no-name";
    
    if(this.exportName){
      exportName=this.exportName
      useCurrentDir=false;
    }
    
    if(useCurrentDir){
      var rx=new RegExp("/[^/]+$")
      exportName=rx.exec(this.path);
      exportName=exportName[0].substr(1);
    }
    
    name=exportName;
    if(ext)
      name=exportName+ext;
    
    return name;
  },
}

// new ScanDirectory(path)
