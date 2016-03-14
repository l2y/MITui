%% LPC testing 
% the most useful formants for speech analysis are the first 3.
% this means that for the resulting curve, as a function of frequency and
% on the log-db scale, we can find local optima and drop any formants below
% 50Hz.
clear all;
close all;
[y,fs] = audioread('Hello-short.wav');

ofs = 20000;
y = y(ofs:ofs+(fs*0.10));
t = 0:1/fs:(length(y)-1)/fs;
w = hamming(length(y));
yold = y;
y = y.*w;

% magnitude spectrum and LP spectral envelope
L = length(yold);
YOLD = fft(yold);
YOLD = YOLD(1:round(L/2)+1); % discard negative freq range
figure(1);

freq = fs*(0:round(L/2))/L;
hold on


Y = fft(y);t
Y = Y(1:round(L/2)+1);
plot(freq, db(abs(YOLD/L)),'b');
plot(freq,db(abs(Y/L)),'r');

p = fs/1000 + 5; %order
[a,g] = lpc(y,p);
lspec = freqz(g,a,freq,fs);
plot(freq,db(abs(lspec)),'k');

[a,g] = lpc(yold,p);
lspec = freqz(g,a,freq,fs);
plot(freq,db(abs(lspec)),'g');
xlim([0 5000]);
xlabel('Frequency (Hz)');
ylabel('Magnitude (dB)');
legend('raw signal FFT','hamming window signal FFT','hamming window signal LPC','raw signal LPC');

%% LPC test w/ resampling & preemphasis
% from doc: 'decimate' lowpass filters the input to guard against aliasing and downsamples the result.
close all;
[y,fs] = audioread('Hello-short.wav');

y10k = decimate(y, 4);

