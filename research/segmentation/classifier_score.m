function [score,formants_actual] = classifier_score( filepath, phrase_index )
%function [formants_actual] = classifier_score( envelopevar, y, fs )

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
[pks_in,lcs_in]=findpeaks(envelopevar+rwinvec);
%figure()
%plot(envelopevar+rwinvec);
[~,lcs]=peaks_custom(pks_in,lcs_in);
length(lcs)
formants_actual = zeros(syllable_count,3);
i = 1;
bar_count = 1;
while(i<(length(lcs)))
    if(bar_count<=syllable_count)
        section = y(lcs(i):lcs(i+1));
        middle = (lcs(i)+lcs(i+1))/2;
        
%         mtxSamples = zeros(fs*0.2, length(-2:2));
        rg = (1:31);
        mtxFormants = zeros(length(rg),3);
        sampleRanges = zeros(length(rg),2);
        ofsC = ceil(length(rg)/2);
        
        for n = rg
            ofs = (n-ofsC)*fs*0.025;
            %floor(middle+ofs)
            % here, sample is a column vector.
            % let's make the rows different samples.
            n1 = floor(middle+ofs);
            n2 = floor(middle+ofs+(fs*0.2));

            sample = y(floor(middle+ofs):floor(middle+ofs+(fs*0.2)));
            mtxFormants(n,:) = getLPC(sample,fs);
            sampleRanges(n,:) = [n1 n2]; 
            
        end
        
        
        
        winLoc = (sampleRanges(:,1) + sampleRanges(:,2))/2;
        
        figure()
        scatter(winLoc,mtxFormants(:,1));
        hold on
        scatter(winLoc,mtxFormants(:,2));
        scatter(winLoc,mtxFormants(:,3));
        
        
        sample = y(floor(middle-fs*.02):floor(middle+fs*.02));
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

