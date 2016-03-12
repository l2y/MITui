
%% LPC testing 
clear all;
close all;
[y,fs] = audioread('Hello-short.wav');
ofs = 60000;
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
%plot(freq,db(abs(Y) / 1024));

Y = fft(y);
Y = Y(1:round(L/2)+1);
plot(freq, db(abs(YOLD/2048)),'b');
plot(freq,db(abs(Y/2048)),'r');



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
ofs = 60000;
y = y(ofs:ofs+(fs*0.10));

y10k = decimate(y, 4);
fsn = 44100/4;

w = hamming(length(y10k));
y10k = w.*y10k;


% preemphasize?



% number of poles is 2 times expected, plus 2.
freq = 0:5000/512:5000-1;
Ys = fft(y10k, 1024);
Ys = Ys(1:512);
figure(2)
plot(freq,db(abs(Ys/1024)),'r');
hold on
p = 50;
[a,g] = lpc(y10k,p);
lspec = freqz(g,a,freq,fs);
plot(freq,20*log10(abs(lspec)),'b');
