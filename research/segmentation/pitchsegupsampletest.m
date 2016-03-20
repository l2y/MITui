% try to upsample pitch to 44100/4

clear all
close all
fileID = fopen('howareyoupitch.txt','r');
formatSpec = '%f %f';
sizeA = [2 Inf];

A = fscanf(fileID,formatSpec,sizeA);
fclose(fileID);

t = A(1,:);
pitch = A(2,:);

% looks like normalizing produces same results-ish.
pitch = normalizesig(pitch,0,1);



% try rolling variance window with ~18 samples on the pitch contour.
windowSize = 18;
rwinvec = rolVarWin(pitch,windowSize);

[ax, h1, h2] = plotyy(t, pitch, t, rwinvec, 'scatter', 'plot');
set(h1, 'CData', [1 0.5 0.5]);
set(get(ax(1), 'Ylabel'), 'String', 'Frequency (Hz)');
set(get(ax(2), 'Ylabel'), 'String', 'Rolling Variance');
xlabel('Time (s)');

legend('Praat pitch contour','18 sample rolling variance window');


