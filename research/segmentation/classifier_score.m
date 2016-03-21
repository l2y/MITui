function [score] = classifier_score( filepath, phrase_index )
%function [smptr,rwinvec,envelopevar] = classifier_score( filepath, phrase_index )

%Get expected values
fileID = fopen('word_index.txt');
sizeA = [2 Inf];
A = fscanf(fileID, '%d %d', sizeA);
A=A';
fclose(fileID);
syllable_count = A(phrase_index,2);
fileID = fopen(sprintf('./word_formant_frequencies/%d.txt', phrase_index));
sizeA = [3 syllable_count];
A = fscanf(fileID, '%d %d %d', sizeA);
formants_expected=A';

%Envelope Segmentation
[y,fs] = audioread(filepath);
r = 4;
y = decimate(y,r);
fs = fs/r;
fNy = fs/2;
yrect = abs(y);
[B,A] = butter(2, 40/fNy);
fenvelope = filtfilt(B,A,yrect);
fenvelope = normalizesig(fenvelope,0,1);
windowSize = (1.5e4 / 4);
envelopevar = rolVarWin(fenvelope,windowSize);

%Pitch Segmentation
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
[pitchrs,tr] = resample(pitch,t,Fs,'linear');
if abs(length(pitchrs) - length(fenvelope)) > 0
    minlen = min(length(envelopevar),length(fenvelope));
    pitchrs = pitchrs(1:minlen);
    tr = tr(1:minlen);
    fenvelope = fenvelope(1:minlen);
end
smptr = (1:length(tr));
windowSize = (1.5e4/4);
rwinvec = rolVarWin(pitchrs,windowSize);


%plot(smptr,rwinvec);
%hold on
%plot(smptr,envelopevar);
%hold off
%legend('rolling window pitch variance', ...
%    'rolling window envelope variance');
%xlabel('f[n]');
%ylabel('variance');


%Compare expected and actual

%Should be fixed
%TODO @ TOM: FIX PEAKS COUNTER CODE, IT IS VERY VERY FINICKY
% I did some perf tuning; functions are extremely similar.
% it is very sensitive to noise & that's not super ok?
% please try and fix it.

[pks_in,lcs_in]=findpeaks(envelopevar);
[~,lcs]=peaks_custom(pks_in,lcs_in);
length(lcs)
formants_actual = zeros(syllable_count,3);
i = 1;
bar_count = 1;
while(i<(length(lcs)))
    if(bar_count<=syllable_count)
        middle = (lcs(i)+lcs(i+1))/2;
        sample = y(middle-fs*.01:middle+fs*.01);
        formants = getLPC(sample,fs);
        formants_actual(bar_count,:) = formants_actual(bar_count,:)+formants;
    end
    if(bar_count==4)
        bar_count=1;
    else
        bar_count=bar_count+1;
    end
    i=i+1;
end
formants_actual = formants_actual./4;

score = formants_actual-formants_expected;   

end

