clear all
close all
[y,fs] = audioread('How Are You.wav');

% real talk, let's try downsampling it
r = 4;
y = decimate(y,r);
fs = fs/r;

plot(y);

% fullwave rectify the filtered(?) signal
yrect = abs(y);
plot(yrect);

% LPF rectified signal at envelope cutoff (40Hz)
fNy = fs/2;
[B,A] = butter(2, 40/fNy);
fenvelope = filtfilt(B,A,yrect);
% bidirectional filter eliminates phase distortion
% but who cares about that tbh


hold on
plot(fenvelope);
xlabel('samples');
ylabel('|f[n]|');
legend('amplitude of rectified signal','40Hz filtered signal');

%test note: windowsize needs to be even, so does fenvelope.

windowSize = (1.5e4 / 4);

rwinvec = rolVarWin(fenvelope,windowSize);

plot(rwinvec.*50);
hold on
plot(fenvelope);