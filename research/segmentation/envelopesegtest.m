clear all
close all
[y,fs] = audioread('I am Good.wav');

% real talk, let's try downsampling it
r = 4;
y = decimate(y,r);
fs = fs/r;


% noise-robustness: we should cut off frequencies
% above the nyquist frequencies before rectifying.
% edit: decimate has a built in FIR filter
% that removes frequency content above the nyquist rate
% for the new sampling rate so we don't need to do this.

fNy = fs/2;
figure(1)
plot(y);

% fullwave rectify the filtered(?) signal
yrect = abs(y);
plot(yrect);

% LPF rectified signal at envelope cutoff (40Hz)

[B,A] = butter(2, 40/fNy);
fenvelope = filtfilt(B,A,yrect);
% bidirectional filter eliminates phase distortion
% but who cares about that tbh

% normalize the envelope?
fenvelope = normalizesig(fenvelope,0,1);

hold on
plot(fenvelope);
xlabel('samples');
ylabel('|f[n]|');
legend('amplitude of rectified signal','40Hz filtered signal');

%test note: windowsize needs to be even, so does fenvelope.

windowSize = (1.5e4 / 4);

envelopevar = rolVarWin(fenvelope,windowSize);

plot(envelopevar);
hold on
plot(fenvelope);
