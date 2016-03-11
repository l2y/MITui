//MIT
var STEPS = ["Listen", "Sing The Phrase", "Sing the Phrase Again", "Listen", "Independent Singing"];
var INSTRUCTIONS = ["Listen to the tones, this will be the pitch you will be singing at in the next step",
                    "Try and sing along with the phrase",
                    "Try and sing along with the phrase again, the sound will slowly fade out near the end. Keep singing until indicated",
                    "Once again, listen to the phrase",
                    "Sing the phrase on your own."];
var AUDIO_FILE = [];
var CurrentStep = 0;

//Percentage result numbers
var highFreqPerc = 0;
var lowFreqPerc = 0;
var averageFreqPerc = 0;

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
var word = "";
var stepToAudio = [ 1, 0, 2, 0, 1] 
var _audioArray;

window.onload = function(e) {   
    beginSession();
}

function startIt(w) {
    word = w;
    $("#word").text(w);
    
    
    $('.circle').addClass('open');
        $("#start-screen").addClass("fadeOut");
        $("#start-screen").addClass("animated");
            $("#start-screen").addClass('hidden');
            $("#start-screen").removeClass('show');
            $("#start-next-screen").addClass('hidden');
            $("#start-next-screen").removeClass('show');
            $('#opening-screen').addClass('hidden');
            $('#opening-screen').removeClass('show');
    
            $('#action-screen').addClass('show');
            $('#action-screen').removeClass('hidden');
    
            $('#action-screen').addClass('fadeIn');
            $('#action-screen').addClass('animated');  
    
            $("#countdown-screen").addClass("show");
            $("#countdown-screen").removeClass("hidden"); 
            setTimeout(function() {
                setTimeout(function() {
                    initAudio();
                    $('#action-screen').removeClass('fadeIn');
                    $('#action-screen').removeClass('animated');
                    $('#start-screen').removeClass('fadeOut');
                    $('#start-screen').removeClass('animated');
                }, 1000);
            }, 1000);
}

/** RECORDING **/

function gotBuffers( buffers ) {
    audioRecorder.exportWAV( doneEncoding );
}

function doneEncoding( blob ) {
 	var fd = new FormData();
	fd.append("upload", blob, "sample.wav");
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.overrideMimeType("multipart/form-data");
  	xmlhttp.open("POST","http://localhost:80/upload");
	xmlhttp.send(fd);
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
    var BAR_WIDTH = 2;
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
    var height = magnitude*2;
    analyserContext.fillRect(((BAR_WIDTH * timer) + SPACING * timer), canvasHeight, BAR_WIDTH, -1 * magnitude);
    
    
    if (((BAR_WIDTH * timer) + SPACING * timer) > canvasWidth) {
        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        buffer += timer;
        starting = 0;
    }
    
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function reqListener () {
    var resp = this.responseText.split("\r\n");
    highFreqPerc = parseFloat(resp[0]);
    lowFreqPerc = parseFloat(resp[1]);
    averageFreqPerc = ((parseFloat(highFreqPerc) + parseFloat(lowFreqPerc)) / 2);
    setStatistic('stats-high-pitch',highFreqPerc.toFixed(0) + '%');
    setStatistic('stats-low-pitch',lowFreqPerc.toFixed(0) + '%');
    setStatistic('stats-pitch-accuracy',averageFreqPerc.toFixed(0) + '%');
    console.log(highFreqPerc);
    console.log(lowFreqPerc);
    console.log(averageFreqPerc);
}

function postPulse(){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST","http://localhost:80");
	xmlhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
	xmlhttp.send(null);
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();
    if (CurrentStep == 3) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET","http://localhost:80");
        xmlhttp.send(null);
    }
    setTimeout(function(){
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

        //CHANGE AUDIO HERE
        
        _audioArray = setAudio();
        
       	audioRecorder.record(); 
       	postPulse();
        //countdown here
        setTimeout(function() {
            $("#countdown").empty();
            $("#countdown").html(3);
            
            setTimeout(function() {
                $("#countdown").empty();
                $("#countdown").html(2);
                
                setTimeout(function() {
                    $("#countdown").empty();
                    $("#countdown").html(1);
                    
                    setTimeout(function() {
                        $("#countdown").empty();
                        $("#countdown").html('GO');

                        setTimeout(function() {
                            $("#countdown-screen").addClass("hidden");
                            $("#countdown-screen").removeClass("show"); 

                            $("#countdown").empty();
                            $("#countdown").html('.');

                            _audioArray[stepToAudio[CurrentStep]].play();
                            updateAnalysers();

                            setTimeout(function() {
                                if (CurrentStep == 3) {
                                    var xmlhttp = new XMLHttpRequest();
                                    xmlhttp.addEventListener("load", reqListener);
                                    xmlhttp.open("GET","http://localhost:90"); 
                                    xmlhttp.send(null);
                                }
                                endSession();
                            }, 16000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
				
    }, 3000);
}

function setAudio(){
    //hold all audio in global then pointers to current
    var w = $("#word").text();
    if (w == 'Water') {
        var audio1 = new Audio('sound/Water (higher pitch).wav');
        var audio2 = new Audio('sound/Water (higher pitch)_humming.wav');
        var audio3 = new Audio('sound/Water (higher pitch)_fade.wav');
        _audioArray = [audio1, audio2, audio3];
    } else if (w == 'Hello') {
        var audio1 = new Audio('sound/Hello.wav');
        var audio2 = new Audio('sound/Hello_humming.wav');
        var audio3 = new Audio('sound/Hello_fade.wav');
        _audioArray = [audio1, audio2, audio3];
    } else if (w == 'How Are You'){
        var audio1 = new Audio('sound/How Are You.wav');
        var audio2 = new Audio('sound/How Are You_humming.wav');
        var audio3 = new Audio('sound/How Are You_fade.wav');
        _audioArray = [audio1, audio2, audio3];
    } else if (w == 'I Am Good'){
        var audio1 = new Audio('sound/I Am Good.wav');
        var audio2 = new Audio('sound/I Am Good_humming.wav');
        var audio3 = new Audio('sound/I Am Good_fade.wav');
        _audioArray = [audio1, audio2, audio3];
    } else if (w == 'I Love You'){
        var audio1 = new Audio('sound/I Love You.wav');
        var audio2 = new Audio('sound/I Love You_humming.wav');
        var audio3 = new Audio('sound/I Love You_fade.wav');
        _audioArray = [audio1, audio2, audio3];
    } else if (w == 'Ice Cream'){
        var audio1 = new Audio('sound/Ice Cream.wav');
        var audio2 = new Audio('sound/Ice Cream_humming.wav');
        var audio3 = new Audio('sound/Ice Cream_fade.wav');
        _audioArray = [audio1, audio2, audio3];
    } else if (w == 'Thank You'){
        var audio1 = new Audio('sound/Thank You.wav');
        var audio2 = new Audio('sound/Thank You_humming.wav');
        var audio3 = new Audio('sound/Thank You_fade.wav');
        _audioArray = [audio1, audio2, audio3];
    }
    return _audioArray;
}

function initAudio() {
        if (!navigator.getUserMedia){
			navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		}
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
        });
}


function endSession() {
    $('#continue-screen').removeClass('hidden');
    $('#continue-screen').addClass('show');
		audioRecorder.stop();	
    cancelAnalyserUpdates();
	_audioArray[stepToAudio[CurrentStep]].pause()
	_audioArray[stepToAudio[CurrentStep]].currentTime=0;
	audioRecorder.getBuffers( gotBuffers );
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
    $("#start-next-screen").addClass("show");
    $("#start-next-screen").removeClass("hidden");
    beginSession();
}

function beginSession() {
    //next screen
    if (CurrentStep < INSTRUCTIONS.length) {
        $("#start-instruction").empty();
        $("#start-instruction").html(INSTRUCTIONS[CurrentStep]);
        $("#action-instruction").empty();
        $("#action-instruction").html(STEPS[CurrentStep]);
        $("#action-next-instruction").empty();
        $("#action-next-instruction").html(INSTRUCTIONS[CurrentStep]);

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

        if (CurrentStep != 0) {
            $("#start-next-screen").addClass("show");
            $("#start-next-screen").removeClass("hidden");
        }
    //stats screen
    } else {

//        $("#stats-screen").addClass("show");
//        $("#stats-screen").removeClass("hidden");
        
        $("#restart-screen").addClass("show");
        $("#restart-screen").removeClass("hidden");
        
        $("#continue-screen").addClass("hidden");
        $("#continue-screen").removeClass("show");  
        
        $("#action-screen").addClass("hidden");
        $("#action-screen").removeClass("show");  
    }
}

function setStatistic(id, value) {
    $("#" + id).empty();
    $("#" + id).html(value);
}
