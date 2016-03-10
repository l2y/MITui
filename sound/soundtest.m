clear all
close all


[y,fs] = audioread('Hello.wav');

y = y(1:fs*2.5);

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

