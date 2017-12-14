var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var exec = require('child_process').exec,child, child1;
var fs=require('fs');
global.idProcesos = [];

global.ProcesosId = [];
global.ProcesosNombre = [];
global.ProcesosUsuario = [];
global.ProcesosEstado = [];
global.ProcesosRam = [];


global.cantidadsuspendidos = 0;
global.cantidadejecucion = 0;
global.cantidaddetenidos = 0;
global.cantidadzombies = 0;



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

  setInterval(function(){
    exec("grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage \"%\"}'" ,
    function(error, stdout, stderr){
      if (error !== null) {
        console.log('exec 1 error: ' + error);
      } else {
        var UsoCPU= "<label>Uso del cpu:</label><h3>"+ stdout+ "</h3>";
          client.emit('EstadisticasCPU', UsoCPU);
        }
      }.bind(this));
    }
    ,1000);

    setInterval(function(){
      exec("awk '/MemTotal/ {print $2}' /proc/meminfo" ,
      function(error, stdout, stderr){
        if (error !== null) {
          console.log('exec 1 error: ' + error);
        } else {
          var enMegaBytes= (stdout/1024)/1024;
          var UsoCPU= "<label>Memoria Total:</label><h3>"+ enMegaBytes+ " MB</h3>";
            client.emit('EstadisticasRam', UsoCPU);
          }
        }.bind(this));
      }
      ,1000);


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
              //client.emit('contador', this.cantidadProcesos + ' ' +idProcesos.length);

              //----------------------------------------------Calculo Estados
              for (j = 0; j < idProcesos.length; j++) {
                // console.log('Valor j 2: ', j);

                try {
                  const readline = require('readline');
                  const fs = require('fs');

                  var directorio = "/proc/"+idProcesos[j]+"/stat";
                  //console.log('Directorio: ', directorio);
                  (function(varDirectorio){
                    fs.stat(varDirectorio, function(err, stats){

                      // console.log('Directorio: ', varDirectorio);
                      if(!(err)){
                        const rl = readline.createInterface({
                          input: fs.createReadStream(varDirectorio)
                        });
                        console.log('Directorio: ', varDirectorio);
                        rl.on('line', function(linea){
                          var spliteada = linea.split(" ")
                          var primera = spliteada[0];//id
                          var segunda = spliteada[1];//nombre
                          var tercera = spliteada[2];//estado
                          var cuarta = spliteada[3];//Usuario
                          var quinta = spliteada[24];//memoria



                          //console.log('Leyendo estado: ', idProcesos[j]);
                          // var comparacion = stdout.localeCompare("S")
                          // console.log('Local compare: ' + comparacion);
                          // console.log('Local compare: ' + stdout.trim()+ "-");
                          // console.log('Local compare: ' + "S");
                          if (0 == tercera.trim().localeCompare("S")) {
                            cantidadsuspendidos ++;
                          }else if (0 == tercera.trim().localeCompare("R")) {
                            cantidadejecucion ++;
                          }else if (0 == tercera.trim().localeCompare("T")) {
                            cantidaddetenidos ++;
                          }else if (0 == tercera.trim().localeCompare("Z")) {
                            cantidadzombies ++;
                          }
                          ProcesosId.push(primera);
                          ProcesosNombre.push(segunda);
                          ProcesosUsuario.push(cuarta);
                          ProcesosEstado.push(tercera);
                          ProcesosRam.push(quinta);




                        } );
                      }
                    });})(directorio)

                  } catch (err) {
                    console.log('exec 3 error: ' + err);
                  }


                }
                var Total = ProcesosId.length;
                var Totales =  ` <div class="row">
                <div class="col-sm-3">
                Total Procesos: `+ Total +`
                </div>
                <div class="col-sm-2">
                En Ejecución: `+ cantidadejecucion +`
                </div>
                <div class="col-sm-2">
                Suspendidos: `+ cantidadsuspendidos +`
                </div>
                <div class="col-sm-2">
                Detenidos: `+ cantidaddetenidos +`
                </div>
                <div class="col-sm-2">
                Zombies:`+ cantidadzombies +`
                </div>

                `;

                var tabla = Totales + `<div><table
                class='table table-hover'>
                <thead>
                <tr>
                <th scope='col'>Id</th>
                <th scope='col'>Nombre</th>
                <th scope='col'>Usuario</th>
                <th scope='col'>Estado</th>
                <th scope='col'>Memoria</th>
                </tr>
                </thead>
                <tbody>`;
                var estados = "";
                for (i = 0; i < ProcesosNombre.length; i++) {
                  tabla += `<tr>
                  <td>"` + ProcesosId[i]+`"</td>
                  <td>"` + ProcesosNombre[i]+`"</td>
                  <td>"` + ProcesosUsuario[i]+`"</td>
                  <td>"` + ProcesosEstado[i]+`"</td>
                  <td>"` + ProcesosRam[i]+`"</td>

                  </tr>`;

                  estados += ProcesosNombre[i] + "-";

                }

                tabla += `</tbody>
                </table>`;
                // client.emit('contador', "Procesos Suspendidos: "
                // +cantidadsuspendidos+"<br/>"+
                // "Procesos en Ejecución: "
                // +cantidadejecucion+"<br/>"+
                // "Procesos Detenidos: "
                // +cantidaddetenidos+"<br/>"+
                // "Procesos Zombies: "
                // +cantidadzombies+"<br/>"+
                // ProcesosNombre.length +" - " + estados + " - ");

                client.emit('contador', tabla);
                ProcesosNombre=[];
                ProcesosId=[];
                ProcesosNombre=[];
                ProcesosUsuario=[];
                ProcesosEstado=[];
                ProcesosRam=[];

                cantidadsuspendidos =0;
                cantidadejecucion= 0;
                cantidaddetenidos = 0;
                cantidadzombies=0;
              }.bind(this))
            }
          )
        }
        ,5000);

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
        //ProcesosNombre= [];
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


        function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

        server.listen(3000);
