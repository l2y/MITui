clear all
close all
[y,fs] = audioread('Hello-short.wav');
ofs = 20000;
y = y(ofs:ofs+(fs*0.20));
L = length(y);
w = hamming(L);
freq = fs*(0:round(L/2))/L;

function [formants] = formants(windowedsignal,fs)
    L = length(windowedsignal);
    freq = fs*(0:round(L/2))/L;
    p = fs/1000 +5 ;
    [a,g] = lpc(y,p);
    lspec = freqz(g,a,freq,fs);
    lspec = db(abs(lspec));
    %plot(freq,lspec);
    %xlim([0 5000]);
    [~,locs] = findpeaks(lspec);
    formants = freq(locs(1:3));
end

%function [formants] = rollinglpc(input,windowlength,fs)  % windowlength as # of samples
    
