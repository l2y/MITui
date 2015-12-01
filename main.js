window.onload = function(e) {
    var w = window.innerWidth - 100;
    var h = window.innerHeight - 100;
    
    document.getElementById("main-screen").style.width = w + "px";
    document.getElementById("main-screen").style.height  = h + "px";
    document.getElementById("main-screen").style.marginTop = "50px";
    document.getElementById("main-screen").style.marginLeft = "50px";
    
    w = (window.innerWidth - 120)/2;
    document.getElementById("end").style.marginLeft = w + "px";
    
    console.log(window.innerWidth);
    console.log(document.getElementById("analyser").offsetWidth);
    console.log(document.getElementById("example-analyser").offsetWidth);
    
    w = (window.innerWidth - document.getElementById("analyser").offsetWidth )/2 - 50;
    console.log(w);
    document.getElementById("analyser").style.marginLeft = w + "px";
    
    w = (window.innerWidth - document.getElementById("example-analyser").offsetWidth )/2;
    document.getElementById("example-analyser").style.marginLeft = w + "px";
}

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    $scope.soundImages = [
                       "sound_1.png",
                       "sound_2.png",
                       "sound_3.png",
                       "sound_4.png",
                       "sound_5.png",
                       "sound_6.png",
                       "sound_7.png",
                       "sound_8.png",
                       "sound_9.png",
                       "sound_10.png",
                       "sound_11.png",
                       "sound_12.png",
                       "sound_13.png",
                       "sound_14.png",
                       "sound_15.png",
                       "sound_16.png",
                       "sound_17.png",
                       "sound_18.png",
                       "sound_19.png",
                       "sound_20.png",
                       "sound_21.png",
                       "sound_22.png",
                       "sound_23.png",
                       "sound_24.png",
                       "sound_25.png"];
    $scope.soundValues = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,24,20,19,18,17,16,15,14,13,12,11,8,6,4,2,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,24,20,19,18,17,16,15,14,13,12,11,8,6,4,2,1];
    $scope.getSoundImage = function(imageName) {
        return "images/" + imageName;
    };
    $scope.getSoundImageFromValue = function(value) {
        return "images/sound_" + value + ".png";
    };
    $scope.start = function($event) {
        $('#start').removeClass('show');
        $('#start').addClass('hidden');
        $('.circle').addClass('open');
        setTimeout(function() {
            $('#opening-screen').addClass('hidden');
            $('#opening-screen').removeClass('show');
            $('#action-screen').addClass('fadeIn');
            $('#action-screen').addClass('animated');   
            setTimeout(function() {
                $scope.hide($event);
                toggleRecording($event.currentTarget);
                setTimeout(function() {
                    initAudio();
                }, 1000);
            }, 1000);
        }, 2000);
    };
    $scope.hide = function($event) {
        if ($event.currentTarget.parentElement) {
            $event.currentTarget.parentElement.className = 'hidden';
        }
    }
});

/** RECORDING **/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
//var canvasWidth, canvasHeight;
var recIndex = 0;

//history of length 200
var history = [];
var historyLength = 200;

function saveAudio() {
    audioRecorder.exportWAV( doneEncoding );
}

function gotBuffers( buffers ) {
//    var canvas = document.getElementById( "wavedisplay" );

//    drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

    // the ONLY time gotBuffers is called is right after a new recording is completed - 
    // so here's where we should set up the download.
    audioRecorder.exportWAV( doneEncoding );
}

function doneEncoding( blob ) {
    console.log('setup DL');
    Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;
}

function toggleRecording( e ) {
    if (e.classList.contains("recording")) {
        // stop recording
        audioRecorder.stop();
//        e.classList.remove("recording");
        audioRecorder.getBuffers( gotBuffers );
    } else {
        // start recording
        if (!audioRecorder)
            return;
//        e.classList.add("recording");
        audioRecorder.clear();
        audioRecorder.record();
    }
}

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

var starting = 0;
var buffer = 0;

function updateAnalysers(time) {
    var timer = parseInt(time/100, 10) - buffer;
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }
    
    if (timer > 0 && starting == 0) {
        starting = timer;
    }

    // analyzer draw code here
    {
        var SPACING = 1;
        var BAR_WIDTH = 5;
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData); 
        
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'butt';
        var length = freqByteData.length;
        
        // Calculate newest volume
        var magnitude = 0;
            for (var j = 0; j < length; j++) {
                magnitude += freqByteData[j];
            }
        magnitude = magnitude / length;
        
        timer = timer - starting;
        
        var xpos = timer > 0 ? (BAR_WIDTH * timer) + SPACING * (timer - starting) : 0;
        var ypos = 0;
        var width = BAR_WIDTH;
        var height = magnitude;
        //check the value slots manually and add to the next spot? but then we cant do buckets..
        analyserContext.fillRect(((BAR_WIDTH * timer) + SPACING * timer), canvasHeight, BAR_WIDTH, -1 * magnitude);
    }
    
    if (((BAR_WIDTH * timer) + SPACING * timer) > canvasWidth) {
        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        buffer += timer;
        starting = 0;
    }
    
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    
    var audio = new Audio('sound/Schwifty.mp3');
    audio.play();
    
    updateAnalysers();
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

function ieReadFile(filename) {
     try {
        var fso  = new ActiveXObject("Scripting.FileSystemObject");
        var fh = fso.OpenTextFile(filename, 1);
        var contents = fh.ReadAll();
        fh.Close();
        return contents;
    }
     catch (Exception)
      {
        alert(Exception);
        return false;
      }
}

function endSession() {
    console.log("i will end you");
    $('#continue-screen').removeClass('hidden');
    $('#continue-screen').addClass('show');
    //stop feedback
    //stop music
}

function nextSession() {
    
}

function sameSession() {
    
}