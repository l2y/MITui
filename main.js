//MIT
var STEPS = ["Pitch Tuning", "Humming", "Singing", "Independent Singing"];
var INSTRUCTIONS = ["Listen to the tones, this will be the pitch you will be singing at",
                    "Try and hum along with the tone",
                    "Try and sing the word along with the voice and tone",
                    "Try and sing the word along with the tone"];
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
var audio = new Audio('sound/water_110_195_words.wav');
var word = "";
audio.loop = true;

window.onload = function(e) {
    var w = window.innerWidth - 100;
    var h = window.innerHeight - 100;
    
    w = (window.innerWidth - document.getElementById("analyser").offsetWidth )/2 - 50;
    document.getElementById("analyser").style.marginLeft = w + "px";

    w = (window.innerWidth - 500 )/2 - 50;
    document.getElementById("continue-button").style.marginLeft = w + "px";
    
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
            $('#action-screen').addClass('fadeIn');
            $('#action-screen').addClass('animated');   
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
        
        audio = setAudio();
        audio.play();
        
        updateAnalysers();

        setTimeout(function() {
            if (CurrentStep == 3) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.addEventListener("load", reqListener);
                xmlhttp.open("GET","http://localhost:90"); 
                xmlhttp.send(null);
            }
            endSession();
        }, 6000);
    }, 3000);
}

function setAudio(){
    var w = $("#word").text();
    if (w == 'Water') {
        if (CurrentStep == 0) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 1) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 2) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 3) {
            audio.src = 'sound/water_110_195_words.wav';
        }
        console.log(audio.src);
    } else if (w == 'Hello') {
        if (CurrentStep == 0) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 1) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 2) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 3) {
            audio.src = 'sound/water_110_195_words.wav';
        }
    } else if (w == 'How Are You'){
        if (CurrentStep == 0) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 1) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 2) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 3) {
            audio.src = 'sound/water_110_195_words.wav';
        }
    } else if (w == 'I Am Good'){
        if (CurrentStep == 0) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 1) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 2) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 3) {
            audio.src = 'sound/water_110_195_words.wav';
        }
    } else if (w == 'I Love You'){
        if (CurrentStep == 0) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 1) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 2) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 3) {
            audio.src = 'sound/water_110_195_words.wav';
        }
    } else if (w == 'Ice Cream'){
        if (CurrentStep == 0) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 1) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 2) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 3) {
            audio.src = 'sound/water_110_195_words.wav';
        }
    } else if (w == 'Thank You'){
        if (CurrentStep == 0) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 1) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 2) {
            audio.src = 'sound/water_110_195_words.wav';
        } else if (CurrentStep == 3) {
            audio.src = 'sound/water_110_195_words.wav';
        }
    }
    return audio;
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
    $("#start-next-screen").addClass("show");
    $("#start-next-screen").removeClass("hidden");
    beginSession();
}

function beginSession() {
    //next screen
    if (CurrentStep < INSTRUCTIONS.length) {
        console.log(CurrentStep);
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

//        $("#start-screen").addClass("show");
//        $("#start-screen").removeClass("hidden");
        if (CurrentStep != 0) {
            $("#start-next-screen").addClass("show");
            $("#start-next-screen").removeClass("hidden");
        }
    //stats screen
    } else {
        $("#stats-screen").addClass("show");
        $("#stats-screen").removeClass("hidden");
        
        
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

function readResults(filename) {
     try {
        var fso  = new ActiveXObject("Scripting.FileSystemObject");
        var fh = fso.OpenTextFile(filename, 1);
        var contents = fh.ReadAll().split('\n');

        highFreqPerc = contents[0].trim();
        lowFreqPerc = contents[1].trim();
        averageFreqPerc = (highFreqPerc + lowFreqPerc) /2;

        fh.Close();
        return contents;
    }
     catch (Exception)
      {
        alert(Exception);
        return false;
      }
}
