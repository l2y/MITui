//MIT
var STEPS = ["Pitch Tuning", "Humming", "Singing", "Independant Singing"];
var INSTRUCTIONS = ["Listen to the tones, this will be the pitch you will be singing at",
                    "Try and hum along with the tone",
                    "Try and sing the word along with the voice and tone",
                    "Try and sing the word along with the tone"];
var AUDIO_FILE = [];
var CurrentStep = 0;

//Drawing
var starting = 0;
var buffer = 0;

//Recording
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null;
var realAudioInput = null;
var inputPoint = null;
var audioRecorder = null;
var rafID = null;
var analyserContext = null;
var recIndex = 0;
var audio = new Audio('sound/Schwifty.mp3');
audio.loop = true;

window.onload = function(e) {
    var w = window.innerWidth - 100;
    var h = window.innerHeight - 100;
    
    document.getElementById("main-screen").style.width = w + "px";
//    document.getElementById("main-screen").style.height  = h + "px";
    document.getElementById("main-screen").style.marginTop = "50px";
    document.getElementById("main-screen").style.marginLeft = "50px";
    
//    w = (window.innerWidth - 120)/2;
//    document.getElementById("end").style.marginLeft = w + "px";
    
    w = (window.innerWidth - document.getElementById("analyser").offsetWidth )/2 - 50;
    document.getElementById("analyser").style.marginLeft = w + "px";
    
//    w = (window.innerWidth - document.getElementById("example-analyser").offsetWidth )/2;
//    document.getElementById("example-analyser").style.marginLeft = w + "px";

    w = (window.innerWidth - 500 )/2 - 50;
    document.getElementById("continue-button").style.marginLeft = w + "px";
    
    beginSession();
}

function startIt() {
    $('.circle').addClass('open');
        $("#start-screen").addClass("fadeOut");
        $("#start-screen").addClass("animated");
        setTimeout(function() {
            $("#start-screen").addClass('hidden');
            $("#start-screen").removeClass('show');
            $('#opening-screen').addClass('hidden');
            $('#opening-screen').removeClass('show');
            $('#action-screen').addClass('fadeIn');
            $('#action-screen').addClass('animated');   
            setTimeout(function() {
                setTimeout(function() {
                    initAudio();
                    $('#action-screen').removeClass('fadeIn');
                    $('#action-screen').removeClass('animated');
                    $('#start-screen').removeClass('fadeOut');
                    $('#start-screen').removeClass('animated');
                    $('.circle').removeClass('open');
                }, 1000);
            }, 1000);
        }, 2000);
}

/** RECORDING **/

function gotBuffers( buffers ) {
    audioRecorder.exportWAV( doneEncoding );
}

function doneEncoding( blob ) {
    console.log('setup DL');
    Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;
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

function updateAnalysers(time) {
    var timer = parseInt(time/40, 10) - buffer;
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    }
    
    if (timer > 0 && starting == 0) {
        starting = timer;
    }
    
    // analyzer draw code here
    
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

    var xpos = timer > 0 ? (BAR_WIDTH * timer) + SPACING * (timer) : 0;
    var ypos = 0;
    var width = BAR_WIDTH;
    var height = magnitude;
    analyserContext.fillRect(((BAR_WIDTH * timer) + SPACING * timer), canvasHeight, BAR_WIDTH, -1 * magnitude);
    
    
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
    
    audio.play();
    
    updateAnalysers();
    
    setTimeout(function() {
        endSession();
    }, 6000);
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
    $('#continue-screen').removeClass('hidden');
    $('#continue-screen').addClass('show');
    cancelAnalyserUpdates();
    audio.pause();
    audio.currentTime = 0;
}

function nextSession() {
    //set the instruction to the next value
    //change audio file
    //tell matlab this will be the next session
    CurrentStep++;
    
    beginSession();
}

function sameSession() {
    //tell matlab this will be a repeated session
    beginSession();
}

function beginSession() {
    if (CurrentStep < INSTRUCTIONS.length) {
        $("#start-instruction").empty();
        $("#start-instruction").html(INSTRUCTIONS[CurrentStep]);
        $("#action-instruction").empty();
        $("#action-instruction").html(STEPS[CurrentStep]);

        if (analyserContext != null) {
            analyserContext.clearRect(0,0,canvasWidth, canvasHeight);
        }

        analyserContext = null;
        starting = 0;
        buffer = 0;

        $("#continue-screen").addClass("hidden");
        $("#continue-screen").removeClass("show"); 

        $("#opening-screen").addClass("show");
        $("#opening-screen").removeClass("hidden"); 

        $('.circle').removeClass('open');

        $("#start-screen").addClass("show");
        $("#start-screen").removeClass("hidden"); 
    } else {
        $("#stats-screen").addClass("show");
        $("#stats-screen").removeClass("hidden");
        
        
        $("#continue-screen").addClass("hidden");
        $("#continue-screen").removeClass("show");  
        
        $("#action-screen").addClass("hidden");
        $("#action-screen").removeClass("show");  
    }
}