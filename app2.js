var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);



app.use(express.static(__dirname + '/node_modules'));
app.set("view engine", "jade");

app.get('/', function (req, res) {
  res.sendFile(__dirname+'/views/indexsocket.html');
});

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });

    client.on('messages', function(data) {
           client.emit('broad', data);
           client.broadcast.emit('broad',data);
    });

    // var contador = 0;
    // setInterval(function(){
    //          contador = aumentar(contador);
    //          client.emit('contador', contador);
    //          }
    // ,1000);

    var contador = 0;
    setInterval(function(){
              contador = aumentar(contador);
              // var resTotales = totales();
              client.emit('contador', contador);
            }
    ,10000);

});


function aumentar(cont)
{
  cont ++;
  return cont;
}

function totales()
{
  var procEjecutando;
  exec("egrep ls /proc > informacion.txt " ,
  function(error, stdout, stderr){
    if (error !== null) {
      console.log('exec 1 error: ' + error);
    } else {
        const readline = require('readline');
        const fs = require('fs');

        const rl = readline.createInterface({
          input: fs.createReadStream('informacion.txt')
        });

        rl.on('line', function (line) {
          console.log('Linea del archivo:', line);
        });
    }
  });
}

server.listen(3000);
