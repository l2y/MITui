clear all;
close all;


%% LPC testing 

[y,fs] = audioread('Hello-short.wav');
ofs = 60000;
y = y(ofs:ofs+(fs*0.10));
t = 0:1/fs:(length(y)-1)/fs;
w = hamming(length(y));
yold = y;
y = y.*w;

%plot(y);

% magnitude spectrum and LP spectral envelope
YOLD = fft(yold,1024);
YOLD = YOLD(1:512); % discard negative freq range
figure(1);
freq = 0:8000/512:8000-1;
hold on
%plot(freq,db(abs(Y) / 1024));

Y = fft(y, 1024);
Y = Y(1:512);
plot(freq, db(abs(YOLD/1024)),'b');
plot(freq,db(abs(Y / 1024)),'r');


p = fs/1000 + 5; %order
[a,g] = lpc(y,p);
lspec = freqz(g,a,freq,fs);
plot(freq,db(abs(lspec)),'k');

[a,g] = lpc(yold,p);
lspec = freqz(g,a,freq,fs);
plot(freq,db(abs(lspec)),'g');
