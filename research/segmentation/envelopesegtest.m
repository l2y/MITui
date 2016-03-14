clear all
close all
[y,fs] = audioread('howareyou-short.wav');
plot(y);

% fullwave rectify the filtered(?) signal
yrect = abs(y);


plot(yrect);

% TODO: check the 40Hz LPF method vs. 
% using matlab's envelope(x) function


% LPF rectified signal at envelope cutoff (40Hz) using 
% 2nd order butterworth filter, bidirectional.
% the cutoff freqnecy (Wn) must be 0.0<Wn<1.0, with 1.0
% being the Nyquist frequency.
fNy = fs/2;
[B,A] = butter(2, 40/fNy);

% returns filter coefficients in 
% length (2+1) vectors B (num) and A (den)
% listed in descending powers of z.

% bidirectional filter is matlab's filtfilt.
fenvelope = filtfilt(B,A,yrect);
hold on
plot(fenvelope);
xlabel('samples');
ylabel('|f[n]|');
legend('amplitude of rectified signal','40Hz filtered signal');











