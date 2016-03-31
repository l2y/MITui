//MIT
var PRESTEPS = ["",  "",  "", "Listen", "Listen"];
var STEPS = ["Listen", "Sing The Phrase", "Sing the Phrase Again", "Independent Singing", "Answer the Question"];
var INSTRUCTIONS = ["Listen to the humming of the phrase, followed by the singing of the phrase.",
                    "Try and sing the phrase together with the audio.",
                    "Try and sing the phrase together with the audio. Keep singing as the audio fades out.",
                    "First, listen to the audio. After the audio is finished, try and sing the phrase on your own.",
                    "Try and answer the following question, by repeating the phrase you just learnt."];

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
//hum+sing, sing, sing fade, sing, question
var stepToAudio = [ 1, 0, 2, 0, 3] 
var timeCountdownAudio = [0, 0 ,0, 16000, 4000];
var icon = ["images/listen-icon.png", "images/speak-icon.png"];
var iconPreOrder = [0, 1, 1, 0, 0];
var iconDuringOrder = [0, 1, 1, 1, 1];
var breatheAnimation = [0, 0, 0, 1, 1];
var recordingCounter = [32, 16, 16, 16, 16];
var _audioArray;

//Counter
var id;
var counter = 32;

//Instructions

var step1 = new Audio('sound/Step 1 Humming.wav');
var step2 = new Audio('sound/Step 2 Unison Intoning.wav');
var step3 = new Audio('sound/Step 3 Unison Intoning with Fading.wav');
var step4 = new Audio('sound/Step 4 Immediate Repetition.wav');
var step5 = new Audio('sound/Step 5 Response to a Probe Question.wav');
var instructionAudio = [step1, step2, step3, step4, step5];

window.onload = function(e) {   
    beginSession();
    // loadGraph1(function(data) {
    //     console.log(data);
    //     document.getElementById("timing-pitch-graph-image").src += data;  
    // });

    // loadGraph2(function(data) {
    //     console.log(data);
    //     document.getElementById("classification-graph-image").src += data;  
    // });
}

function startIt(w) {
    word = w;
    if (word != null && word != "") {
        newSession(w);
        // loadGraph1();
    }
    $("#word").text(w);
    instructionAudio[CurrentStep].pause();
    instructionAudio[CurrentStep].currentTime = 0;

    $('#icon-instruction').addClass('show');
    $('#icon-instruction').removeClass('hidden');
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
    
    toggleImage(icon[iconPreOrder[CurrentStep]]);
    toggleBreathe(CurrentStep);
    
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

function toggleImage(image) {
    document.getElementById("icon-instruction-image").src = image;   
}

function toggleBreathe(step) {
    if (breatheAnimation[step] == 1) {
        $("#icon-instruction-image").addClass("playBreathe");
    } else {
        $("#icon-instruction-image").removeClass("playBreathe");
    }
}

/** RECORDING **/

function gotBuffers( buffers ) {
    audioRecorder.exportWAV( doneEncoding );
    audioRecorder.clear();
}

function doneEncoding( blob ) {
 	var fd = new FormData();
    // var data = "";
    // if (word != null) data = word;
	fd.append($("#word").text(), blob, "sample.wav");
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.overrideMimeType("multipart/form-data");
  	xmlhttp.open("POST","http://localhost:80/upload");
	xmlhttp.send(fd);
    console.log("Send uploads")
}

function loadGraph1( num ) {
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://localhost:80/loadGraphReal");
    xmlhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) 
        {
            if(xmlhttp.status == 200)
            {
                console.log(xmlhttp.responseText);
                document.getElementById("classification-graph-image").src = xmlhttp.responseText;
            }
            else
                dump("Error loading page\n");
        }
    }
    xmlhttp.send(word);
}

// function loadGraph2() {
    
//     var xmlhttp = new XMLHttpRequest();
//     xmlhttp.open("POST","http://localhost:80/loadGraph1");
//     xmlhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");

//     xmlhttp.onreadystatechange = function () {
//         if (xmlhttp.readyState == 4) 
//         {
//             if(xmlhttp.status == 200)
//             {
//                 console.log(xmlhttp.responseText);
//                 document.getElementById("classification-graph-image").src = xmlhttp.responseText;
//             }
//             else
//                 dump("Error loading page\n");
//         }
//     }
//     xmlhttp.send(word);
// }

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
        
        var spot = 0;
        //draw starting points for repeats
        while(spot < 1400) {
            var SPACING = 1;
            var BAR_WIDTH = 2;

            analyserContext.fillStyle = '#41A8C1';
            analyserContext.lineCap = 'butt';

            var magnitude = 50;

            var xpos = spot;
            var ypos = 0;
            var width = BAR_WIDTH;
            var height = magnitude*2;
            analyserContext.fillRect(((BAR_WIDTH * spot) + SPACING * spot), canvasHeight, BAR_WIDTH, -1 * magnitude); 
            spot+=100;
        }
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

function postPulse(word, CurrentStep){

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://localhost:80");
	xmlhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
	xmlhttp.send(word+','+CurrentStep);
    console.log("Send pulse");
}

function newSession( word ) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://localhost:80/newSession");
    xmlhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
    xmlhttp.send(word);
}

function cont( cont ) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://localhost:80/cont");
    xmlhttp.setRequestHeader("content-type","application/x-www-form-urlencoded");
    xmlhttp.send(cont);
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
        if (realAudioInput == null)
        realAudioInput = audioContext.createMediaStreamSource(stream);
        audioInput = realAudioInput;
        audioInput.connect(inputPoint);

        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        inputPoint.connect( analyserNode );
        
        if (audioRecorder == null)
            audioRecorder = new Recorder( inputPoint );

        zeroGain = audioContext.createGain();
        zeroGain.gain.value = 0.0;
        inputPoint.connect( zeroGain );
        zeroGain.connect( audioContext.destination );

        //CHANGE AUDIO HERE
        
        _audioArray = setAudio();
        
        if (CurrentStep == 4 || CurrentStep == 3)
        _audioArray[stepToAudio[CurrentStep]].play();
        setTimeout(function() {
            
            setTimeout(function() {
                $('#countdown-text').empty();
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
                                startTimer();
                                audioRecorder.record(); 
                                $("#countdown-screen").addClass("hidden");
                                $("#countdown-screen").removeClass("show"); 
                                $("#icon-instruction-image").addClass("playBreathe");

                                toggleImage(icon[iconDuringOrder[CurrentStep]]);
                                
//                                _audioArray[stepToAudio[CurrentStep]].play();
                                if(word == null){
                                    postPulse('Next Step', CurrentStep);
                                } else {
                                    postPulse(word, CurrentStep);
                                }

                                $("#countdown").empty();

                                if (CurrentStep != 4 && CurrentStep != 3)
                                    _audioArray[stepToAudio[CurrentStep]].play();
                                if (CurrentStep != 0)
                                    updateAnalysers();
                                if (CurrentStep == 3)
                                    loadGraph1(9)
                                var timeout = 16000;
                                if (CurrentStep == 0) {
                                    timeout = 32000;
                                } else {
                                    timeout = 16000;
                                }
                                setTimeout(function() {
                                    $("#icon-instruction-image").removeClass("playBreathe");
                                    endSession();
                                }, timeout);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, timeCountdownAudio[CurrentStep]);
				
    }, 3000);
}

function setAudio(){
    //hold all audio in global then pointers to current
    var w = $("#word").text();
    if (w == 'Water') {
        var audio1 = new Audio('sound/Water (higher pitch).wav');
        var audio2 = new Audio('sound/Water (higher pitch)_hum_sing.wav');
        var audio3 = new Audio('sound/Water (higher pitch)_fade.wav');
        var audio4 = new Audio('sound/Water_question.wav');
        // loadGraph1(1);
        _audioArray = [audio1, audio2, audio3, audio4];
    } else if (w == 'Hello') {
        var audio1 = new Audio('sound/Hello.wav');
        var audio2 = new Audio('sound/Hello_hum_sing.wav');
        var audio3 = new Audio('sound/Hello_fade.wav');
        var audio4 = new Audio('sound/Hello_question.wav');
        // loadGraph1(2);
        _audioArray = [audio1, audio2, audio3, audio4];
    } else if (w == 'How Are You'){
        var audio1 = new Audio('sound/How Are You.wav');
        var audio2 = new Audio('sound/How Are You_hum_sing.wav');
        var audio3 = new Audio('sound/How Are You_fade.wav');
        var audio4 = new Audio('sound/How Are You_question.wav');
        // loadGraph1(3);
        _audioArray = [audio1, audio2, audio3, audio4];
    } else if (w == 'I Am Good'){
        var audio1 = new Audio('sound/I Am Good.wav');
        var audio2 = new Audio('sound/I Am Good_hum_sing.wav');
        var audio3 = new Audio('sound/I Am Good_fade.wav');
        var audio4 = new Audio('sound/I Am Good_question.wav');
        // loadGraph1(4);
        _audioArray = [audio1, audio2, audio3, audio4];
    } else if (w == 'I Love You'){
        var audio1 = new Audio('sound/I Love You.wav');
        var audio2 = new Audio('sound/I Love You_hum_sing.wav');
        var audio3 = new Audio('sound/I Love You_fade.wav');
        var audio4 = new Audio('sound/I Love You_question.wav');
        // loadGraph1(5);
        _audioArray = [audio1, audio2, audio3, audio4];
    } else if (w == 'Ice Cream'){
        var audio1 = new Audio('sound/Ice Cream.wav');
        var audio2 = new Audio('sound/Ice Cream_hum_sing.wav');
        var audio3 = new Audio('sound/Ice Cream_fade.wav');
        var audio4 = new Audio('sound/Ice Cream_question.wav');
        // loadGraph1(6);
        _audioArray = [audio1, audio2, audio3, audio4];
    } else if (w == 'Thank You'){
        var audio1 = new Audio('sound/Thank You.wav');
        var audio2 = new Audio('sound/Thank You_hum_sing.wav');
        var audio3 = new Audio('sound/Thank You_fade.wav');
        var audio4 = new Audio('sound/Thank You_question.wav');
        // loadGraph1(7);
        _audioArray = [audio1, audio2, audio3, audio4];
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
	_audioArray[stepToAudio[CurrentStep]].pause();
	_audioArray[stepToAudio[CurrentStep]].currentTime = 0;
	audioRecorder.getBuffers( gotBuffers );
}

function nextSession() {
    //set the instruction to the next value
    //change audio file
    //tell matlab this will be the next session
    cont("cont");
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
    $('#icon-instruction').addClass('hidden');
    $('#icon-instruction').removeClass('show');
    
    document.getElementById("counter").innerHTML = recordingCounter[CurrentStep];
    counter = recordingCounter[CurrentStep];

    //next screen
    if (CurrentStep < INSTRUCTIONS.length) {
        // Play instructions
        instructionAudio[CurrentStep].play();
        
        $("#start-instruction").empty();
        $("#start-instruction").html(INSTRUCTIONS[CurrentStep]);
        $("#action-instruction").empty();
        $("#action-instruction").html(STEPS[CurrentStep]);
        $("#countdown-text").html(PRESTEPS[CurrentStep]);
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
    //stats/restart screen
    } else {

        // loadGraph1(function(data) {
        //     if (err) throw err;
        //     console.log(data);
        //     document.getElementById("timing-pitch-graph-image").src = data;  
        // });

        // loadGraph2(function(data) {
        //     if (err) throw err;
        //     console.log(data);
        //     document.getElementById("classification-graph-image").src = data;  
        // });

        var scores = getScores();
        
        $('#timing-score').innerHTML = "Timing Score:" + scores[0];
        $('#pitch-score').innerHTML = "Pitch Score:" + scores[1];
        $('#classification-score').innerHTML = "Classification Score:" + scores[2];

        // document.getElementById("timing-pitch-graph-image").src = "images/button-hover.png";  
        // document.getElementById("classification-graph-image").src = "images/button-hover.png";  
        
        // document.getElementById("timing-pitch-graph-image").src = loadGraph1;   
        // document.getElementById("classification-graph-image").src = loadGraph2;

        $("#restart-screen").addClass("show");
        $("#restart-screen").removeClass("hidden");
        
        $("#continue-screen").addClass("hidden");
        $("#continue-screen").removeClass("show");  
        
        $("#action-screen").addClass("hidden");
        $("#action-screen").removeClass("show");
    }
}

function getScores() {
    var rawFile = new XMLHttpRequest();
    var allText;
    //GET FILE LOCATION
    rawFile.open("GET", "results/Scores.txt", false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    
    return allText.split(" ");
}

function startTimer() {
    id = setInterval(function() {
        counter--;
        if(counter < 0) {
            document.getElementById("counter").innerHTML = 0 ;
            clearInterval(id);
        } else {
            document.getElementById("counter").innerHTML = counter.toString();
        }
    }, 1000);
}

function setStatistic(id, value) {
    $("#" + id).empty();
    $("#" + id).html(value);
}