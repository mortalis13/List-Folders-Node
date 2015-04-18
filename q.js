
var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');

var jQuery = require('jquery')
var jsdom = require("jsdom")
var qs = require('querystring');
var mysql=require('mysql')

var scandir = require("./scandir.js")
var ScanDirectory = scandir.ScanDirectory

var root = __dirname;
var post={}
var config_table='config'

var port=3000, host='localhost'

var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'list_folders_node'
});

var server = http.createServer(function(req, res){
  var url = parse(req.url).pathname;
  if(url=='/') url='index.html'

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
  if(url=='index.html'){
    
    var body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ body += chunk });
    req.on('end', function(){
      post = qs.parse(body);
      var path=post.path
      
      new ScanDirectory(post)
      var value=JSON.stringify(post)
      updateConfig('last', value)
      
      show(res, url);
    });
  }
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
        var last,path,filterExt,excludeExt,filterDir
        var $=jQuery(window)
        
        
        loadOptions(function(last){
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
          
          var html=$('html').html()
          if(scandir.text) html+=scandir.text
          body='<html>'+html+'</html>'
          
          res.end(body)
        })
        
        function setVal(id,value){
          $('#'+id).attr('value',value)
        }
      }
      else
        res.end(body)
    })
  })
}

function updateConfig(name, value){
  var sql
  var table=config_table;
      
  sql="select name from "+table+" where name=?";
  db.query(
    sql,
    [name],
    function(err, rows){
      if(err) throw err
        
      if(!rows.length){
        addConfig(name,value)
        return
      }
      
      sql="update "+table+" set value=? where name=?"
      db.query(
        sql,
        [value,name]
      )
    }
  )
  
}

function addConfig(name,value){
  var table=config_table;
  var sql="insert into "+table+" (name,value) values(?,?)";
  
  db.query(
    sql,
    [name,value]
  )
}

function loadOptions(cb){
  var table=config_table;
  sql="select value from "+table+" where name='last'";
  db.query(
    sql,
    function(err, rows){
      if(err) throw err
        
      res=false
      if(rows.length) 
        res=rows[0].value
      cb(res)
    }
  )
}
