clear all
close all
[y,fs] = audioread('Hello-short.wav');
ofs = 20000;
y = y(ofs:ofs+(fs*0.20));
L = length(y);
w = hamming(L);
y = y.*w;
%freq = fs*(0:round(L/2))/L;

windowedsignal = y;

% returns first 3 formants for a windowed signal
%function formants = formants(windowedsignal,fs)
    L = length(windowedsignal);
    freq = fs*(0:round(L/2))/L;
    p = fs/1000 +5 ;
    [a,g] = lpc(y,p);
    lspec = freqz(g,a,freq,fs);
    lspec = db(abs(lspec));
    %plot(freq,lspec);
    %xlim([0 5000]);
    [~,locs] = findpeaks(lspec);
    if freq(locs(1)) < 200
        formants = freq(locs(2:4));
    else
        formants = freq(locs(1:3));
    end
    
    %include checks to discard formants that are too low (these are F0)
    %lowest avg. frequency of any vowel for F1 is 240hz. let's use a cutoff
    % of 200.
    
    
    
%end

%function [formants] = rollinglpc(input,windowlength,fs)  % windowlength as # of samples
    
