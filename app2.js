var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec,child, child1;



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
              var cantidadProcesos = totales();
              client.emit('contador', cantidadProcesos );
            }
    ,5000);

});


function aumentar(cont)
{
  cont ++;
  return cont;
}


function totales()
{
  this.cantidadProcesos = 0;
  exec("ls /proc > informacion.txt " ,
  function(error, stdout, stderr){
    if (error !== null) {
      console.log('exec 1 error: ' + error);
    } else {
        const readline = require('readline');
        const fs = require('fs');

        const rl = readline.createInterface({
          input: fs.createReadStream('informacion.txt')
        });

        console.log('Primer nivel:', this.cantidadProcesos);
        //leo cada linea
        rl.on('line', function (line) {
          var esnum = isNumber(line)
          console.log('Segundo nivel:', this.cantidadProcesos);
          if(esnum){
            cantidadProcesos ++;

            //console.log('Linea del archivo:', line);
          }
          console.log('Total Procesos', this.cantidadProcesos);
        });

    }
  });
  return cantidadProcesos;
}


function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

server.listen(3000);
