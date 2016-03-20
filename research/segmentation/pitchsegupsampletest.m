% try to upsample pitch to 44100/4


fileID = fopen('howareyoupitch.txt','r');
formatSpec = '%f %f';
sizeA = [2 Inf];

A = fscanf(fileID,formatSpec,sizeA);
fclose(fileID);
Fs = 44100 / 4;

t = A(1,:);
pitch = A(2,:);
pitch = normalizesig(pitch,0,1);

[pitchrs,tr] = resample(pitch,t,Fs,'linear');
smptr = (1:length(tr));
plot(smptr,pitchrs);

% looks like normalizing produces same results-ish.

windowSize = (1.5e4/4);
rwinvec = rolVarWin(pitchrs,windowSize);
figure();
[ax, h1, h2] = plotyy(smptr, pitchrs, smptr, rwinvec, 'scatter', 'plot');
set(h1, 'CData', [1 0.5 0.5]);
set(get(ax(1), 'Ylabel'), 'String', 'Frequency (Hz)');
set(get(ax(2), 'Ylabel'), 'String', 'Rolling Variance');
xlabel('Time (s)');

legend('Praat pitch contour','18 sample rolling variance window');

