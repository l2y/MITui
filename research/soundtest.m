clear all
close all

[y,fs] = audioread('Hello-short.wav');

NS = length(y);
TS = NS/fs;
time = (1:NS)/fs;

N = 4096;
T = N/fs;
fmax = 4000;
w=hann(N);
dN = 16; %1.3 ms overlap at 48000Hz
[s,f,t]=spectrogram(y,w,N-dN,N,fs);
figure(1);
imagesc(t,f,20*log10(abs(s)+1));
colormap(gray);
axis xy;
xlabel('time(sec)');
ylabel('freq(Hz)');
ylim([0 fmax]);

%%Now try it using specialized window sizes... 


M = round(0.02*fs); %20ms window more useful for speech modelling
w = hamming(M);
dN = 16;
[s,f,t] = spectrogram(y,w,M-dN,N,fs);
figure(2);
imagesc(t,f,20*log10(abs(s)+1));
ylim([0 fmax]);
colormap(gray);
axis xy;

%% Narrowband Spectrogram
% long-time spectrum calculations (~20ms window).
% emphasize frequency changes in signal.

% (0.02 sec * 44100/s = 844);

N = 1024;
w = hamming(N);
o = N-16;
figure(1);
spectrogram(y,w,o,N,fs,'yaxis');
colormap(flipud(gray));
ylim([0 9]);
title('Narrowband Spectrogram');

%% Wideband Spectrogram - manual plot
% short time spectrum calculations (~3ms window).
% emphasize temporal changes in signal (good for speech analysis);
% (0.003 sec * 44100/s = 132);

N = 512;
w = hamming(N);
o = N-16;
figure(99);
%spectrogram(y,w,o,N,fs,
[s,f,t] = spectrogram(y,w,o,N,fs);
imagesc(t,f,db(abs(s))+1);
colormap(flipud(gray));
title('Wideband Spectrogram, Hamming window manual plot');
axis xy;
xlabel('time(sec)');
ylabel('freq(Hz)');
ylim([0 5000]);

%% Narrowband Spectrogram - manual plot

N = 1024;
w = hamming(N);
o = N-16;
figure(10);
[s,f,t] = spectrogram(y,w,o,N,fs);
clims = [-40 25];
imagesc(t,f,db(abs(s)),clims);
colorbar

colormap(flipud(gray));
title('Narrowband Spectrogram, Hamming window manual plot');
axis xy;
xlabel('time(sec)');
ylabel('freq(Hz)');
ylim([0 5000]);





%% Wideband Spectrogram - autoplot
N = 512;
w = hamming(N);
o = N-16;
figure(3);
spectrogram(y,w,0,N,fs,'yaxis');
colormap(flipud(gray));
ylim([0 10]);
title('Wideband Spectrogram, Hamming window autoplot');

