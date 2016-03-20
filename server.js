var connect = require('connect');
var wav = require('wav');
var serveStatic = require('serve-static');
var formidable = require('formidable');
var serialport = require('serialport');
connect().use(serveStatic(__dirname)).listen(8080);

var exec = require('child_process').exec,
    path = require('path'),
    fs   = require('fs');

// HACK: to make our calls to exec() testable,
// support using a mock shell instead of a real shell
var shell = process.env.SHELL || 'sh';

// Merges the current environment variables and custom params for the environment used by child_process.exec()
function createEnv(params) {
    var env = {};
    var item;

    for (item in process.env) {
        env[item] = process.env[item];
    }

    for(item in params) {
        env[item] = params[item];
    }

    return env;
}

// var serialportname = 'COM15';
// var sp = new serialport.SerialPort(serialportname, {
// 	baudRate: 9600,
// 	dataBits: 8,
// 	parity: 'none',
// 	stopBits: 1,
// 	flowControl: false,
// 	parser: serialport.parsers.readline("\r\n")
// });

function pulse() {
	sp.write("HELLO\r\n");
}

function pulseStream(barPosition,beatPosition,Syllables) {
	if(barPosition<=4) {
		if(beatPosition <= Syllables ) {
			pulse();
		}
		if(beatPosition<4) {
			setTimeout(function(){
				pulseStream(barPosition,beatPosition+1,Syllables);
			},950);
		} else {
			setTimeout(function(){
				pulseStream(barPosition+1,1,Syllables);
			},950);
		}
	}
}

function syllableCount(word) {
	switch(word) {
		case "Water":
			return 2;
		case "Hello":
			return 2;
		case "How Are You":
			return 3;
		case "I Am Good":
			return 3;
		case "I Love You":
			return 3;
		case "Ice Cream":
			return 2;
		case "Thank You":
			return 2;
	}
}

// scriptFile must be a full path to a shell script
exports.exec = function (scriptFile, workingDirectory, environment, callback) {
    var cmd;

    if (!workingDirectory) {
        callback(new Error('workingDirectory cannot be null'), null, null);
    }

    if (!fs.existsSync(workingDirectory)) {
        callback(new Error('workingDirectory path not found - "' + workingDirectory + '"'), null, null);
    }

    if (scriptFile === null) {
        callback(new Error('scriptFile cannot be null'), null, null);
    }

    if (!fs.existsSync(scriptFile)) {
        callback(new Error('scriptFile file not found - "' + scriptFile + '"'), null, null);
    }
}

var http = require('http');
var previousWord = '';
recordingCount = 0;
uploadDir = "C:\\Users\\Cain\\workspace\\MITui\\research";

//Lets define a port we want to listen to
const PORT80=80;
const PORT90=90; 

//We need a function which handles requests and send response
function handleRequest(request, response){
	if(request.method == 'GET'){
		console.log('handling get request');
  		response.setHeader('Access-Control-Allow-Origin','*'); 
  		wavFile = uploadDir + "\\" + recordingCount + ".wav"
  		pitchTier = uploadDir + "\\" + recordingCount + ".PitchTier"
  		parsedPitch = uploadDir + "\\" + recordingCount + ".text"
		exec('C:\\Users\\Cain\\workspace\\MITui\\pitch_detection_matlab.bat ' 
			+ wavFile + ' ' + pitchTier + ' ' + parsedPitch);
		response.end();
	}
	else
	{
		if(request.url == '/upload') {	
			var form = new formidable.IncomingForm();
			form.uploadDir = uploadDir;
			form.on('file',function(field,file){
				fs.rename(file.path, form.uploadDir + "\\" + recordingCount + ".wav");

				console.log('handling get request');
		  		response.setHeader('Access-Control-Allow-Origin','*'); 
		  		wavFile = uploadDir + "\\" + recordingCount + ".wav"
		  		pitchTier = uploadDir + "\\" + recordingCount + ".PitchTier"
		  		parsedPitch = uploadDir + "\\" + recordingCount + ".text"
				exec('C:\\Users\\Cain\\workspace\\MITui\\pitch_detection_matlab.bat ' 
					+ wavFile + ' ' + pitchTier + ' ' + parsedPitch);
				recordingCount ++;
				response.end();

			});

			form.parse(request,function(err,fields,files){
				if(err){
					console.error(err.message);
					return;
				}
			});
		}
		// else
		// {
		// 	word = '';
		// 	request.on('data',function(data){
		// 		word+=data;
		// 		if(word=='Next Step'){
		// 			//setTimeout(function() {
		// 				pulseStream(1,1,syllableCount(previousWord));
		// 			//},500);
		// 		} else {
		// 			//setTimeout(function() {
		// 				previousWord = word;
		// 				pulseStream(1,1,syllableCount(word));
		// 			//},300);
		// 		}
		// 	});
		// }
		// response.end();
	}
}

function handleResult(request, response){
/*
  	response.setHeader('Access-Control-Allow-Origin','*');
	var fs = require('fs');
    do {                                           
    	var file = "C:\\Users\\Sarah Kelly\\Desktop\\classifier\\pitch_detection_percentage.txt";
    	var exists = fs.existsSync(file);
    	console.log(exists);     
  } while (!exists);

	filename = 'C:\\Users\\Sarah Kelly\\Desktop\\classifier\\pitch_detection_percentage.txt';
	fs.readFile(filename, 'utf8', function(err, data) {
	  	if (err) throw err;
	  	console.log(data);
	  	response.write(data);
	  	response.end();
	});
*/
response.end();
}

//Create a server
var server80 = http.createServer(handleRequest);
var server90 = http.createServer(handleResult);

//Lets start our server
server80.listen(PORT80, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT80);
});

server90.listen(PORT90, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT90);
});





