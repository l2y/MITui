clear all
close all
[y,fs] = audioread('How Are You.wav');

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


% by inspection, we see that the "hardest to detect" boundary 
% has a width of about 0.3e4 samples 

fenvtrim1 = fenvelope(4.1e4:4.4e4);
fenvtrim1v = var(fenvtrim1);

fenvtrim2 = fenvelope(4.4e4:4.7e4);
fenvtrim2v = var(fenvtrim2);

% so we can see that the variance is significantly higher at the edge than
% mid-signal: 3.831e-4 as opposed to 1.22e-5. that's a whole order of
% magnitude.

% another approach:
% http://users.spa.aalto.fi/orasanen/papers/zerospeech_sylseg_2015.pdf
% "smooth waveform in time using 100pt. FIR filter
% that approximates shape of temporal integration window
% in human hearing. 

% 
close all
windowSize = 0.75e4;
L = length(fenvelope);
rwinvec = zeros([L-windowSize 1]);

for t = 1:L-windowSize
    rwinvec(t) = var(fenvelope(t:t+windowSize));
end
figure()

rwinvec = [zeros([windowSize/2 1])' rwinvec' zeros([windowSize/2 1])'];

plot(rwinvec.*50);
hold on
plot(fenvelope)