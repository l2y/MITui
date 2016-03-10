clear all;
close all;
[y,fs] = audioread('Hello.wav');

y = y(1:fs*2.5); % trim to 2.5s
t = 0:1/fs:(length(y)-1)/fs;

%% Narrowband Spectrogram
% long-time spectrum calculations (~20ms window).
% emphasize frequency changes in signal.

% (0.02 sec * 44100/s = 844);

N = 1024;
w = hamming(N);
o = round(0.9*N);
figure(1);
spectrogram(y,w,o,N,fs,'yaxis');
colormap(flipud(gray));
ylim([0 9]);
title('Narrowband Spectrogram');

%% Wideband Spectrogram
% short time spectrum calculations (~3ms window).
% emphasize temporal changes in signal (good for speech analysis);
% (0.003 sec * 44100/s = 132);

N = 512;
w = hamming(N);
o = round(0.99*N);
figure(2);
%spectrogram(y,w,o,N,fs,
spectrogram(y,w,o,N,fs,'yaxis');
colormap(flipud(gray));
ylim([0 9]);
title('Wideband Spectrogram');

%% Wideband Spectrogram w/ Hann window (larger side lobe than 'hamming')

N = 512;
w = rectwin(N);
o = round(0.99*N);
figure(3);
%spectrogram(y,w,o,N,fs,
spectrogram(y,w,o,N,fs,'yaxis');
axis xy;
colormap(flipud(gray));
ylim([0 9]);
title('Wideband Spectrogram');

