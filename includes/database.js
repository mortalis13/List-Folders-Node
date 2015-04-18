
var mysql=require('mysql')

var conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'list_folders_node'
});

var config_table='config'
var options_table='options'

exports.updateOption=function(name, value){
  var sql
  var table=options_table;
  
  sql="select name from "+table+" where name=?";
  conn.query(
    sql,
    [name],
    function(err, rows){
      if(err) throw err
        
      if(!rows.length){
        addOption(name,value)
        return
      }
      
      sql="update "+table+" set value=? where name=?"
      conn.query(
        sql,
        [value,name]
      )
    }
  )
}

exports.updateConfig=function(name, value){
  var sql
  var table=config_table;
      
  sql="select name from "+table+" where name=?";
  conn.query(
    sql,
    [name],
    function(err, rows){
      if(err) throw err
        
      if(!rows.length){
        addConfig(name,value)
        return
      }
      
      sql="update "+table+" set value=? where name=?"
      conn.query(
        sql,
        [value,name]
      )
    }
  )
}

addConfig=function(name,value){
  var table=config_table;
  var sql="insert into "+table+" (name,value) values(?,?)";
  
  conn.query(
    sql,
    [name,value]
  )
}

addOption=function(name,value){
  var table=options_table;
  var sql="insert into "+table+" (name,value) values(?,?)";
  
  conn.query(
    sql,
    [name,value]
  )
}

exports.removeOption=function(name){
  var table=options_table;
  var sql="delete from "+table+" where name=?";
  conn.query(
    sql,
    [name]
  )
}

exports.loadOptions=function(cb){
  var table=config_table;
  sql="select value from "+table+" where name='last'";
  conn.query(
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

exports.listOptions=function(cb){
  var key,sql
  var table=options_table;
  
  key='name'
  sql="select "+key+" from "+table+" order by "+key+" asc";
  
  conn.query(
    sql,
    function(err, rows){
      if(err) throw err
        
      res=false
      if(rows.length){
        res=[]
        for(var i in rows)
          res.push(rows[i].name)
      }
      cb(res)
    }
  )
}

exports.getOption=function(name,cb){
  var key,sql
  var table=options_table;
  
  key='name'
  sql="select value from "+table+" where name=?";

  debugger  // getOption:132
    
  conn.query(
    sql,
    [name],
    function(err, rows){
      if(err) throw err
        
      debugger  // getOption:138
        
      res=false
      if(rows.length){
        res=rows[0].value
      }
      cb(res)
    }
  )
}
