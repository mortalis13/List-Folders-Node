
var fs=require('fs')
var path="C:/1-Roman/Documents/8-test/test"

exports.text=""
var nl='\n'

exports.ScanDirectory=function(post){
  var path, filterExt, excludeExt, filterDir
  
  this.path=this.formatPath(post.path)
  this.filterExt=post.filterExt
  this.excludeExt=post.excludeExt
  this.filterDir=post.filterDir
  
  this.doExportText=post.export_text
  this.doExportMarkup=post.export_markup
  this.doExportTree=post.export_tree
  
  this.text=[]
  this.markup=[]
  
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
    
    debugger
      
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
    data,list,pad,count
    var json=[]
    
    data=fs.readdirSync(dir)
    list=this.prepareData(data,dir)
    pad=this.getPadding(level)  
    
    count=list.length
    // if(!count) return false
      
    list.forEach(function(value){
      var item=dir+'/'+value
      
      if(self.is_dir(item)){
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
    return path
  },
  
  filterFile: function(value){
    return true
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
  
  getIcon: function(file){
    var ext, icon, path, iconExt
    
    ext="";
    icon="jstree-file";
    // path=this.iconsPath;
    iconExt=".png";
    
    return icon
  },
  
  replaceTemplate: function(tmpl, replacement, text){
    var text=text.replace(tmpl, replacement)
    return text
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
    var exportPath, treeName, tmpl, doc
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
    
    // $filters=$this->getFiltersText();
    // $this->replaceTemplate("_Filters_", "Filters: ".$filters, $doc);
    
    fs.writeFileSync(exportPath+exportDoc,doc)
    fs.writeFileSync(jsonPath+exportJSON,json)
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
    if(ext)
      name=exportName+ext;
    
    return name;
  },
}

// new ScanDirectory(path)
