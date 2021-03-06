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


%estimate kernel for this dist
pd2 = fitdist(pitch','Kernel');
xp = (0:0.001:1);
ypd2 = pdf(pd2,xp);
ycd2 = cdf(pd2,xp);

%use findpeaks, and 2.5 as the heuristic.
[pks,idx] = findpeaks(ypd2);
%highestmean = 0.0;
hmeanidx = 0;
for i = 1:length(pks)
    if pks(i) > 2.5
 %       highestmean = pks(i);
        hmeanidx = idx(i);
    end
end

% figure()
% subplot(211)
% plot(xp,ypd2);
% subplot(212)
% plot(xp,ycd2);

threshidx = find(ycd2>0.95,1);
plot(ycd2)

% because our pdf has 1000 samples
% then this corresponds between 0 and 1 for
% normalized pitch. 
% threshidx / 1000 is then the NORMALIZED pitch cutoff.

npitch = pitch;
npitch(npitch>(threshidx/1000)) = hmeanidx/1000;
% figure()
% plot(t,pitch);
% hold on
% plot(t,npitch);
% xlabel('time(s)');
% ylabel('Normalized Pitch');



%before resampling, we should add to the t and pitch
%vectors so the times will line up appropriately.
% to do this, we need to know the time "t" 
% for the other signal.
% this is the index of the last sample / Fs.


[pitchrs,tr] = resample(npitch,t,Fs,'linear');

% due to floating point errors, we get a few extra samples. 
% truncate the longer one to the length of the shorter one.
if abs(length(pitchrs) - length(fenvelope)) > 0
    minlen = min(length(envelopevar),length(fenvelope));
    pitchrs = pitchrs(1:minlen);
    tr = tr(1:minlen);
    fenvelope = fenvelope(1:minlen);
end
smptr = (1:length(tr));

% looks like normalizing produces same results-ish, but 
% we should do it anyways.


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

%lpf sum curve
[bb,aa] = butter(4,0.2);
fo = filtfilt(bb,aa,rwinvec + envelopevar);
plot(smptr,fo);
hold off
legend('rolling window pitch variance', ...
    'rolling window envelope variance', ...
    'sum rolling window variances');
xlabel('f[n]');
ylabel('variance');

