
var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');

var jQuery = require('jquery')
var jsdom = require("jsdom")
var qs = require('querystring');

var scandir = require("./scandir.js")
var ScanDirectory = scandir.ScanDirectory

var db=require('./includes/database.js')
var man_opt=require('./includes/manage_options.js')

var root = __dirname;
var post={}

var port=3000, host='localhost'

var server = http.createServer(function(req, res){
  var url = parse(req.url).pathname;
  if(url=='/') url='index.html'
  scandir.text=""

  switch(req.method){
    case 'GET':
      show(res, url)
      break
    case 'POST':
      doPost(req, res, url)
      break
  }
});

server.listen(port);
console.log("Listening to port 3000 ...")

function doPost(req, res, url){
  var body = '';
  req.on('data', function(chunk){ body += chunk });
  
  if(url=='index.html'){
    req.setEncoding('utf8');
    req.on('end', function(){
      post = qs.parse(body);

      new ScanDirectory(post)
      var value=JSON.stringify(post)
      db.updateConfig('last', value)
      
      show(res, url);
    });
  }else if(url=='/manage-options'){
    req.on('end', function(){
      post = qs.parse(body);
      var action=post.action
      var result
      
      switch(action){
        case 'add':
          addOption(res,post)
          break
        case 'remove':
          removeOption(res,post)
          break
        case 'load':
          loadOption(res,post)
          break
      }
    })
  }
}

function addOption(res, post) {
  var result=man_opt.addOption(post)
  res.setHeader("Content-Type", "text/plain");
  result && res.end('option-add')
}

function removeOption(res, post) {
  var result=man_opt.removeOption(post)
  res.setHeader("Content-Type", "text/plain");
  result && res.end('option-remove')
}

function loadOption(res, post) {
  man_opt.loadOption(post,function(result){
    res.setHeader("Content-Type", "text/plain");
    result && res.end(result)
  })
}

function show(res, url, text) {
  var path = join(root, url);
  var body=""
  
  var stream=fs.createReadStream(path)
  stream.on('data',function(chunk){
    body+=chunk
  })
  
  stream.on('end',function(chunk){
      
    jsdom.env(body, function(err, window){
      if(url=='index.html'){
        var last,path,filterExt,excludeExt,filterDir,optionsList
        var $=jQuery(window)
        
        db.loadOptions(function(last){
          if(last){
            last=JSON.parse(last)
            path=last.path
            filterExt=last.filter_ext;
            excludeExt=last.exclude_ext;
            filterDir=last.filter_dir;
          }
          
          setVal('path',path)
          setVal('filter-ext',filterExt)
          setVal('exclude-ext',excludeExt)
          setVal('filter-dir',filterDir)
          
          db.listOptions(function(data){
            if(!data)
              optionsList="-No options-";
            optionsList=wrapOptions(data);
            
            $('#options-list').html(optionsList)
            
            var html=$('html').html()
            if(scandir.text) html+=scandir.text
            body='<html>'+html+'</html>'
            
            res.end(body)
          });
        })
        
        function setVal(id,value){
          var elem=$('#'+id)
          var tag=elem[0].tagName.toLowerCase()
          switch(tag){
            case 'input':
              elem.attr('value',value)
              break
            case 'textarea':
              elem.html(value)
              break
          }
        }
      }
      else
        res.end(body)
    })
  })
}

function wrapOptions(list){
  if(typeof list=='string')
    return '<option value="-1">'+list+"</option>";
  
  for(var i in list){
    var option=list[i]
    list[i]="<option value="+option+">"+option+"</option>";
  }
  list=list.join("\n");
  return list;
}
