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

%% LPC test w/ resampling
% from doc: 'decimate' lowpass filters the input to guard against aliasing and downsamples the result.
close all;
[y,fs] = audioread('Hello-short.wav');

r = 4;                      % decimation factor
y10k = decimate(y, r);
fsn = fs/r;                 % 11025 Hz

ofs = 5000;
y10k = y10k(ofs:ofs+(fsn*0.20));
LN = length(y10k);
t = 0:1/fsn:(LN-1)/fsn;
w = hamming(LN);
y10k = y10k.*w;

freqn = fsn*(0:round(LN/2))/LN;

pn = fsn/1000 + 5;
[an,gn] = lpc(y10k,pn);
lspecn = freqz(gn,an,freqn,fsn);
lspecn = db(abs(lspecn));
plot(freqn,lspecn);
xlabel('Frequency (Hz)');
ylabel('Magnitude (dB)');
xlim([0 5000]);
[~,locs] = findpeaks(lspecn);
if freqn(locs(1)) < 200
    formants = freq(locs(2:4));
else
    formants = freq(locs(1:3));
end







