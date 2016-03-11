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
figure(2);
%spectrogram(y,w,o,N,fs,
[s,f,t] = spectrogram(y,w,0,N,fs);
imagesc(t,f,db(abs(s))+1);
colormap(flipud(gray));
title('Wideband Spectrogram, Hamming window manual plot');
axis xy;
xlabel('time(sec)');
ylabel('freq(Hz)');
ylim([0 10000]);

% %% Crazy LPC spectrogram test 
% N = 512;
% w = hamming(N);
% o = N-16;
% figure(3)
% [s,f,t] = modspect(y,w,0,N,fs);
% imagesc(t,f,db(abs(s))+1);
% colormap(flipud(gray));
% title('Crazy Spectrogram');

%% something else

% % Wideband Spectrogram - autoplot
% N = 512;
% w = hamming(N);
% o = N-16;
% figure(3);
% spectrogram(y,w,0,N,fs,'yaxis');
% colormap(flipud(gray));
% ylim([0 10]);
% title('Wideband Spectrogram, Hamming window autoplot');

% %% LPC testing 
% 
% [y,fs] = audioread('Hello.wav');
% ofs = 60000;
% y = y(ofs:ofs+(fs*0.10));
% t = 0:1/fs:(length(y)-1)/fs;
% w = hamming(length(y));
% yold = y;
% y = y.*w;
% 
% %plot(y);
% 
% % magnitude spectrum and LP spectral envelope
% YOLD = fft(yold,1024);
% YOLD = YOLD(1:512); % discard negative freq range
% figure(1);
% freq = 0:8000/512:8000-1;
% hold on
% %plot(freq,db(abs(Y) / 1024));
% 
% Y = fft(y, 1024);
% Y = Y(1:512);
% plot(freq, db(abs(YOLD/1024)),'b');
% plot(freq,db(abs(Y / 1024)),'r');
% 
% 
% 
% 
% 
% % lpc test
% p = fs/1000 + 5; %order% %% LPC testing 
% 
% [y,fs] = audioread('Hello.wav');
% ofs = 60000;
% y = y(ofs:ofs+(fs*0.10));
% t = 0:1/fs:(length(y)-1)/fs;
% w = hamming(length(y));
% yold = y;
% y = y.*w;
% 
% %plot(y);
% 
% % magnitude spectrum and LP spectral envelope
% YOLD = fft(yold,1024);
% YOLD = YOLD(1:512); % discard negative freq range
% figure(1);
% freq = 0:8000/512:8000-1;
% hold on
% %plot(freq,db(abs(Y) / 1024));
% 
% Y = fft(y, 1024);
% Y = Y(1:512);
% plot(freq, db(abs(YOLD/1024)),'b');
% plot(freq,db(abs(Y / 1024)),'r');
% 
% 
% 
% 
% 
% % lpc test
% p = fs/1000 + 5; %order
% [a,g] = lpc(y,p);
% lspec = freqz(g,a,freq,fs);
% plot(freq, db(abs(lspec)),'k');
% 
% [a,g] = lpc(yold,p);
% lspec = freqz(g,a,freq,fs);
% plot(freq,db(abs(lspec)),'g');
% 
% 
% 
% 
% 
% 
% 

% [a,g] = lpc(y,p);
% lspec = freqz(g,a,freq,fs);
% plot(freq, db(abs(lspec)),'k');
% 
% [a,g] = lpc(yold,p);
% lspec = freqz(g,a,freq,fs);
% plot(freq,db(abs(lspec)),'g');
% 
% 
% 
% 
% 
% 
% 
