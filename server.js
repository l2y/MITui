var connect = require('connect');
var wav = require('wav');
var serveStatic = require('serve-static');
var formidable = require('formidable');
var serialport = require('serialport');
var rmdir = require('rimraf');
var word = "";
connect().use(serveStatic(__dirname)).listen(8080);

var exec = require('child_process').exec,
		path = require('path');
		fs = require('fs');

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

var serialportname = 'COM3';
var sp = new serialport.SerialPort(serialportname, {
	baudRate: 9600,
	dataBits: 8,
	parity: 'none',
	stopBits: 1,
	flowControl: false,
	parser: serialport.parsers.readline("\r\n")
});

function pulse() {
	sp.write("HELLO\r\n");
}

function pulseStream(barPosition,beatPosition,Syllables, CurrentStep) {
	totalBar = 4;
	if (CurrentStep == 0) {
		totalBar = 8;
	}
	if(barPosition<=totalBar) {
		if(beatPosition <= Syllables ) {
			pulse();
		}
		if(beatPosition<4) {
			setTimeout(function(){
				pulseStream(barPosition,beatPosition+1,Syllables, CurrentStep);
			},1000);
		} else {
			setTimeout(function(){
				pulseStream(barPosition+1,1,Syllables, CurrentStep);
			},1000);
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


var http = require('http');
var previousWord = '';
var recordingCount = 0;
var currentWord = "";
var newSession = true;
var uploadDir = "C:\\Users\\Cain\\workspace\\MITui\\recordings";
// var uploadDir = "C:\\Users\\Sarah Kelly\\Documents\\University\\SYDE 461\\Code\\Website\\recordings";
var version = 0;

//Lets define a port we want to listen to
const PORT80=80;
const PORT90=90; 

//We need a function which handles requests and send response
function handleRequest(request, response){
	response.setHeader('Access-Control-Allow-Origin','*'); 
	console.log('handling get request');
	
	if(request.url == '/upload') {
		var form = new formidable.IncomingForm();
		form.uploadDir = uploadDir;
		form.on('file',function(field,file){
			if (newSession) {
				version = 0;
				while (fs.existsSync(form.uploadDir + "\\" + currentWord + "\\" + version)) {
					version++;
				}
				fs.mkdir(form.uploadDir + "\\" + currentWord + "\\" + version);
				recordingCount = 0;
				newSession = false;
			}
			
			wavFile = uploadDir + "\\" + currentWord + "\\" + version + "\\" + recordingCount + ".wav"
	  		pitchTier = uploadDir + "\\" + currentWord + "\\" + version + "\\" + recordingCount + ".PitchTier"
	  		parsedPitch = uploadDir + "\\" + currentWord + "\\" + version + "\\" + recordingCount + ".txt"

			fs.rename(file.path, form.uploadDir + "\\" + currentWord + "\\" + version + "\\" + recordingCount + ".wav");
			exec('C:\\Users\\Cain\\workspace\\MITui\\praat_pitch_detection.bat ' 
				+ wavFile + ' ' + pitchTier + ' ' + parsedPitch, function() {
					setTimeout(function() {
						if(recordingCount==1 && currentWord=='IAmGood'){
							var spawn = require('child_process').spawn;
							ls = spawn('cmd.exe',['/c','word_classification_matlab.bat 4 ' + version]);
							ls.stdout.on('data',function(data){
								console.log('stdout: ' + data);
							});
							ls.on('exit', function(code){
								console.log('child process exited with code ' + code);
							});
						}
					}, 1000);
				});
			
			// var spawn = require('child_process').spawn;
			// ls = spawn('cmd.exe',['/c','praat_pitch_detection.bat '+wavFile+' '+pitchTier+' '+parsedPitch]);
			// ls.stderr.on('data', function(data){
			// 	console.log('stderr: '+data);
			// });
			response.end();
		});

		form.parse(request,function(err,fields,files){
			if(err){
				console.error(err.message);
				return;
			}
		});
	} else if (request.url == '/newSession') {
		request.on('data',function(data){
			currentWord = "";
			currentWord += data;
			currentWord = currentWord.replace(/ /g,'');
			console.log(currentWord);
			newSession = true;
			recordingCount = 0;
		});
	} else if (request.url == '/cont') {
		request.on('data',function(data){
			recordingCount++;
		});
	}
	else if (request.url == '/loadGraph1') {

		var img = fs.readFile('some-graph-1.png');
     	response.writeHead(200, {'Content-Type': 'image/png' });
     	response.write('some-graph-1.png');
     	response.end();
	}
	else if (request.url == '/loadGraph2') {

		var img = fs.readFile('some-graph-2.png');
     	response.writeHead(200, {'Content-Type': 'image/png' });
     	response.write('some-graph-2.png')
     	response.end();
	}
	else
	{
		word = '';
		request.on('data',function(data){
			word+=data;
			CurrentStep = word.split(',')[1]
			word = word.split(',')[0]
			console.log(word)
			console.log(CurrentStep)
			if(word=='Next Step'){
				pulseStream(1,1,syllableCount(previousWord), CurrentStep);
			} else {
				previousWord = word;
				pulseStream(1,1,syllableCount(word), CurrentStep);
			}
		});
	}
	response.end();
	
}

function handleResult(request, response){

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





