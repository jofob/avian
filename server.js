

/* ------------------------------------------ */
/* ---- AVIAN SERIAL PORT READING SERVER ---- */
/* ------------------------------------------ */

var left;
var right;
var path;

/* REQUIRED NODE MODULES */
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var express = require ('express');

/* EXPRESS SERVER */
var app = module.exports.app = express();
var server = http.createServer(app);
app.use(express.static(__dirname + '/public'));

 /* serves main page */
 
 app.get("/", function(req, res) {
    res.sendFile('index.htm')
 });
 
  app.post("/user/add", function(req, res) { 
	/* some server side logic */
	res.send("OK");
  });
 
 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     res.sendFile( __dirname + req.params[0]); 
 });


/* SERIAL PORT READING */
/* if no arduino is plugged in, comment out this code */
var port = new SerialPort("COM8", {
  parser: serialport.parsers.readline("\n")
	});
	
port.on('data', function(data){
		var buff = new Buffer(data, 'utf8');
		var piece = buff.toString();
		console.log(piece);
		
		var lpiece = piece.slice(0,4);
		if (lpiece.slice(0,1)=="L"){
				left = lpiece;
		}
		
		var rpiece = piece.slice(6,11);
		if (rpiece.slice(0,1)=="R"){
				right = rpiece;
		}
		
	});
	
/* STARTING SERVER */
server.listen(8001);


/* SOCKET.IO COMMUNICATION WITH BROWSER */
var ios = io.listen(server);
ios.sockets.on('connection', function(socket){
    setInterval(function(){
        socket.emit('message', {'message': left});
		socket.emit('message', {'message': right});
  }, 40);
});