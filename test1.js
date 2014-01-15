var sentinelClient = require('redis-sentinel-client');
var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var redis0
var redis1
var redis2
var sentinel0
var sentinel1
var sentinel2

//kills any old redis instances that might be sticking around and cauing problems
function killOldRedises(callback){
  exec("ps aux | grep -ie redis | awk '{print $2}' | xargs kill -9", function(error, stdout, stderr){
    console.log('killOldRedises stdout: ' + stdout);
    console.log('killOldRedises stderr: ' + stderr);
    callback();
  });
}

function startRedis0(){
  redis0 = spawn('redis-server', ['--port', '3680', '--loglevel',  'notice', '--save', '""']); 
  redis0.stdout.on('data', function(data) {
    console.log('redis0: ' + data);
  });
  redis0.stderr.on('data', function(data) {
    console.log('redis0: ' + data);
  });
}

function startRedis1(){
  redis1 = spawn('redis-server', ['--port', '3681', '--loglevel',  'notice', '--save', '""', '--slaveof', 'localhost', '3680']); 
  redis1.stdout.on('data', function(data) {
    console.log('redis1: ' + data);
  });
  redis1.stderr.on('data', function(data) {
    console.log('redis1: ' + data);
  });
}

function startRedis2(){
  redis2 = spawn('redis-server', ['--port', '3682', '--loglevel',  'notice', '--save', '""', '--slaveof', 'localhost', '3680']); 
  redis2.stdout.on('data', function(data) {
    console.log('redis2: ' + data);
  });
  redis2.stderr.on('data', function(data) {
    console.log('redis2: ' + data);
  });
}

//sentinel likes its configs in file form

function startSentinel0(){
  sent0File = fs.openSync('./sent0.conf', 'w');
  fs.writeSync(sent0File,
               'port 26380\n' +
               'sentinel monitor mymaster 127.0.0.1 3680 2\n' + 
               'sentinel down-after-milliseconds mymaster 5000\n' +
               'sentinel failover-timeout mymaster 6000\n' +
               'sentinel parallel-syncs mymaster 1\n');
  sentinel0 = spawn('redis-sentinel', ['./sent0.conf']);
  sentinel0.stdout.on('data', function(data) {
    console.log('sentinel0: ' + data);
  });
  sentinel0.stderr.on('data', function(data) {
    console.log('sentinel0: ' + data);
  });
}

function startSentinel1(){
  sent1File = fs.openSync('./sent1.conf', 'w');
  fs.writeSync(sent1File,
               'port 26381\n' +
               'sentinel monitor mymaster 127.0.0.1 3680 2\n' + 
               'sentinel down-after-milliseconds mymaster 5000\n' +
               'sentinel failover-timeout mymaster 6000\n' +
               'sentinel parallel-syncs mymaster 1\n');

  sentinel1 = spawn('redis-sentinel', ['./sent1.conf']);
  sentinel1.stdout.on('data', function(data) {
    console.log('sentinel1: ' + data);
  });
  sentinel1.stderr.on('data', function(data) {
    console.log('sentinel1: ' + data);
  });
}

function startSentinel2(){
  sent2File = fs.openSync('./sent2.conf', 'w');
  fs.writeSync(sent2File,
               'port 26382\n' +
               'sentinel monitor mymaster 127.0.0.1 3680 2\n' + 
               'sentinel down-after-milliseconds mymaster 5000\n' +
               'sentinel failover-timeout mymaster 6000\n' +
               'sentinel parallel-syncs mymaster 1\n');
  sentinel2 = spawn('redis-sentinel', ['./sent2.conf']);
  sentinel2.stdout.on('data', function(data) {
    console.log('sentinel2: ' + data);
  });
  sentinel2.stderr.on('data', function(data) {
    console.log('sentinel2: ' + data);
  });
}


var clients = {};

function startTheFun(){
  //create client connecting to sentinels
  //clients['0'] = sentinelClient.createClient(26380, '127.0.0.1');
  
  //clients['2'] = sentinelClient.createClient(26382, '127.0.0.1');
  killOldRedises(startAllRedises);
  
}

function startAllRedises(){
  startRedis0();
  startSentinel0();
  startRedis1();
  startSentinel1();
  startRedis2();
  startSentinel2();

  setTimeout(storeData, 15000);
}

function storeData(){
  clients['1'] = sentinelClient.createClient(26381, '127.0.0.1');
  clients['1'].set("foo", "bar");
  clients['1'].on('error', function(err){
    console.log(err);
  });

  setTimeout(killSomeStuff, 1000);
}

function killSomeStuff(){
  redis0.kill();
  sentinel0.kill();

  setTimeout(makeGetRequest, 100);
}

function makeGetRequest(){
    clients['1'].get('foo', function(err, data){
    console.log('A REPLY STAND OUT IN TEH CRAP!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    if(err){
      console.log(err);
    }
    console.log(data);
  });
}

function bringStuffBackUp(){
  

  //startRedis0();
  //startSentinel0();
}

startTheFun();

module.exports = clients;
//setTimeout(function(){
//    //  }, 20000);


