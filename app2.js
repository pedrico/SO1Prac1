var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec,child, child1;
var fs=require('fs');
var idProcesos = [];
var estadoProcesos = [];


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
    setInterval(
          function(){
              contador = aumentar(contador);
              // var resTotales = totales();
              crearArchivo(
                //leerArchivo
                function (funCallback){
                  const readline = require('readline');
                  const fs = require('fs');
                  const rl = readline.createInterface({
                    input: fs.createReadStream('informacion.txt')
                  });

                  console.log('Primer nivel:', this.cantidadProcesos);
                  //leo cada linea
                  rl.on('line', funCallback.bind(this) );
                  rl.on('close', function(data){

                    console.log('Total----------------------:', this.cantidadProcesos);
                    client.emit('contador', this.cantidadProcesos + ' ' +idProcesos.length);

                    totalEstados();
                    var estados = "";
                    for (i = 0; i < estadoProcesos.length; i++) {
                      estados += estadoProcesos[i] + "-";
                    }
                    client.emit('contador', estadoProcesos.length +" - " + estados + " - ");
                  }.bind(this))
                }
              )
          }
    ,3000);

});


function aumentar(cont)
{
  cont ++;
  return cont;
}


function crearArchivo(funLeerArchivo)
{
  this.cantidadProcesos = 0;
  idProcesos = [];
  exec("ls /proc > informacion.txt " ,
  function(error, stdout, stderr){
    if (error !== null) {
      console.log('exec 1 error: ' + error);
    } else {
      //Llamar a leerArchivo
      funLeerArchivo(
        //Sumar Procesos
        function (line) {
        var esnum = isNumber(line)
        if(esnum){
          this.cantidadProcesos ++;
          idProcesos.push(line);
        }
      }.bind(this));
    }
  }.bind(this));
}

function totalEstados(){
  estadoProcesos= [];
  for (j = 0; j < idProcesos.length; j++) {
    fs.open("/proc/"+idProcesos[j]+"/stat",'r',function(err,fd){
        if (err && err.code=='ENOENT') {
          console.log('Archivo no existe: ', idProcesos[this.j]);
        }
        else{

            child = exec("awk '{print $3}' /proc/"+idProcesos[this.j]+"/stat",
            function (error, stdout, stderr) {
              if (error !== null) {
                console.log('exec error: ' + error);
              } else {
                console.log('Leyendo estado: ', idProcesos[this.j]);
                estadoProcesos.push(stdout);
              }
            }.bind(this));

        }
    }.bind(this));




  }
}

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

server.listen(3000);
