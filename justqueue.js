var redis = require('redis');
var child_process = require('child_process');

var redis0;

function killOldRedises(callback){
  child_process.exec("ps aux | grep -ie redis | awk '{print $2}' | xargs kill -9", function(error, stdout, stderr){
    console.log('killOldRedises stdout: ' + stdout);
    console.log('killOldRedises stderr: ' + stderr);
    callback();
  });
}


function startRedis0(){
  redis0 = child_process.spawn('redis-server', ['--port', '6379', '--loglevel',  'debug', '--save', '""']); 
  redis0.stdout.on('data', function(data) {
    console.log('redis0: ' + data);
  });
  redis0.stderr.on('data', function(data) {
    console.log('redis0: ' + data);
  });
}
killOldRedises(startRedis0);

function action(){
  var client = redis.createClient(6379, '127.0.0.1', {alwaysOffline: true});
  client.on('error', function(err){
    console.log('client err: ' + err);
  });
  console.log(client.options);
  client.set('meh', 'blah', function(){
    console.log('set done');

    setImmediate(function(){
      redis0.kill('SIGKILL');
      client.get('meh', function(err, data){
        console.log('get done');
        console.log(data);
      });
    });

  });
}

setTimeout(action, 2000);
