var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080);
console.log('Listening');

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

//Lets define a port we want to listen to
const PORT=80; 

//We need a function which handles requests and send response
function handleRequest(request, response){
	exec('C:\\Users\\Cain\\Desktop\\classifier\\pitch_detection_matlab.bat');
    response.end('It Works!! Path Hit: ' + request.url);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});


