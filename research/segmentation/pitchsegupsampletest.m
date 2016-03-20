% try to upsample pitch to 44100/4


fileID = fopen('./processedPitch/ParsedPitch I am Good.txt','r');
formatSpec = '%f %f';
sizeA = [2 Inf];

A = fscanf(fileID,formatSpec,sizeA);
fclose(fileID);
Fs = 44100 / 4;

t = A(1,:);
pitch = A(2,:);
pitch = normalizesig(pitch,0,1);

t = [0 t (length(fenvelope))/Fs];
pitch = [pitch(1) pitch pitch(length(pitch))];

%before resampling, we should add to the t and pitch
%vectors so the times will line up appropriately.
% to do this, we need to know the time "t" 
% for the other signal.
% this is the index of the last sample / Fs.

[pitchrs,tr] = resample(pitch,t,Fs,'linear');

% due to floating point errors, we get a few extra samples. 
% truncate the longer one to the length of the shorter one.
if abs(length(pitchrs) - length(fenvelope)) > 0
    minlen = min(length(envelopevar),length(fenvelope));
    pitchrs = pitchrs(1:minlen);
    tr = tr(1:minlen);
    fenvelope = fenvelope(1:minlen);
end
smptr = (1:length(tr));

% looks like normalizing produces same results-ish.

windowSize = (1.5e4/4);
rwinvec = rolVarWin(pitchrs,windowSize);
figure();
[ax, h1, h2] = plotyy(smptr, pitchrs, smptr, rwinvec, 'plot', 'plot');

set(get(ax(1), 'Ylabel'), 'String', 'Normalized Frequency (Hz)');
set(get(ax(2), 'Ylabel'), 'String', 'Rolling Variance');
xlabel('samples');

legend('Praat pitch contour','18 sample rolling variance window');


figure();
%now that we've got stuff aligned properly in time and samples
%let's overlay the two graphs and see how we can pick
%out the peaks.
plot(smptr,rwinvec);
hold on
plot(smptr,envelopevar);
hold off
legend('rolling window pitch variance', ...
    'rolling window envelope variance');
xlabel('f[n]');
ylabel('variance');

% figure to showcase nature of pitch contour:
figure()
subplot(221)
plot(pitchrs)
subplot(222)
histogram(pitchrs,100)
subplot(223)
plot(pitch)
subplot(224)
histogram(pitch,100)
%solution: cluster data, find upper mean.
%redistribute samples that are > umean+stddev around umean
%should help eliminate some issues w/ pitch discontinuity
%and sibilance.