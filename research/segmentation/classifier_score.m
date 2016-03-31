function [score,formants_actual] = classifier_score( phrase_index, version, recordingCount )
%function [formants_actual] = classifier_score( envelopevar, y, fs )
set(0, 'DefaultFigureVisible', 'off')

the_fucking_words = cell(2, 7);
the_fucking_words{1, 1} = 2;
the_fucking_words{2, 1} = 'Water';

the_fucking_words{1, 2} = 2;
the_fucking_words{2, 2} = 'Hello';

the_fucking_words{1, 3} = 3;
the_fucking_words{2, 3} = 'HowAreYou';

the_fucking_words{1, 4} = 3;
the_fucking_words{2, 4} = 'IAmGood';

the_fucking_words{1, 5} = 3;
the_fucking_words{2, 5} = 'ILoveYou';

the_fucking_words{1, 6} = 2;
the_fucking_words{2, 6} = 'IceCream';

the_fucking_words{1, 7} = 2;
the_fucking_words{2, 7} = 'ThankYou';

%Get expected values
fileID = fopen('word_index.txt');
sizeA = [2 Inf];
A = fscanf(fileID, '%d %d', sizeA);
A=A';
fclose(fileID);
syllable_count = A(phrase_index,2);
fileID = fopen(sprintf('./word_formant_frequencies/%d.txt', phrase_index));
sizeA = [3 syllable_count];
% A = fscanf(fileID, '%d %d %d', sizeA);
formants_expected=A';

%Envelope Segmentation
%[y,fs] = audioread('I Love You.wav');
%[y,fs] = audioread('Water.wav');
%wavFile = sprintf('C:/Users/Cain/workspace/MITui/recordings/IAmGood/%d/1.wav', version);

currentWord = the_fucking_words{2, phrase_index};
wavFile = sprintf('C:/Users/Cain/workspace/MITui/recordings/%s/%d/%d.wav', currentWord, version, recordingCount);
wavFile
[y,fs] = audioread(wavFile);

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

%Using Pre-recorded
%fileID = fopen('./processedPitch/ParsedPitch 1.txt','r');

%Using Live
absolute_path = sprintf('C:/Users/Cain/workspace/MITui/recordings/%s/%d/%d.txt', currentWord, version, recordingCount);
fileID = fopen(absolute_path,'r');

formatSpec = '%f %f';
sizeA = [2 Inf];
A = fscanf(fileID,formatSpec,sizeA);
fclose(fileID);
Fs = 44100 / 4;
t = A(1,:);
pitch = A(2,:);

t = [0 t (length(fenvelope))/Fs];
pitch = [pitch(1) pitch pitch(length(pitch))];

%%%%%%
% [rwinvec,upitches,pitchrs] = pitchseg(pitch,t,fs,length(y),windowSize);
% 
% %upitches: mean pitch values (hi-lo)
% %pitchrs: pitch signal
% fid = fopen('pitches.txt','w');
% fprintf(fid,'%f,%f\r\n',upitches');
% fid = fclose(fid);
% 
% %plot(smptr,rwinvec);
% %hold on
% %plot(smptr,envelopevar);
% %hold off
% %legend('rolling window pitch variance', ...
% %    'rolling window envelope variance');
% %xlabel('f[n]');
% %ylabel('variance');
% 
% 
% %Compare expected and actual
% 
% %Should be fixed
% %TODO @ TOM: FIX PEAKS COUNTER CODE, IT IS VERY VERY FINICKY
% % I did some perf tuning; functions are extremely similar.
% % it is very sensitive to noise & that's not super ok?
% % please try and fix it.
% [pks_in,lcs_in]=findpeaks(envelopevar+rwinvec);
% %figure()
% %plot(envelopevar+rwinvec);
% [~,lcs]=peaks_custom(pks_in,lcs_in);
% length(lcs)
% formants_actual = zeros(syllable_count,3);
% i = 1;
% bar_count = 1;
% while(i<(length(lcs)))
%     high_pitch = 1000;
%     low_pitch=1000;
%     if(bar_count<=syllable_count)
%         middle = (lcs(i)+lcs(i+1))/2;
% %CODE FOR RANGE OF WINDOWS
% 
%         rg = (1:21);
%         mtxFormants = zeros(length(rg),3);
%         sampleRanges = zeros(length(rg),2);
%         ofsC = ceil(length(rg)/2);
%         
%         for n = rg
%             ofs = (n-ofsC)*fs*0.02;
%             %floor(middle+ofs)
%             % here, sample is a column vector.
%             % let's make the rows different samples.
%             n1 = floor(middle+ofs);
%             n2 = floor(middle+ofs+(fs*0.02));
% 
%             sample = y(n1:n2);
%             mtxFormants(n,:) = getLPC(sample,fs,4);
%             %sampleRanges(n,:) = [n1 n2]; 
%             
%         end
%         
%         %winLoc = (sampleRanges(:,1) + sampleRanges(:,2))/2;
% %         
% %         figure()
% %         scatter(winLoc,mtxFormants(:,1));
% %         hold on
% %         scatter(winLoc,mtxFormants(:,2));
% %         scatter(winLoc,mtxFormants(:,3));
%         %sample = y(floor(middle-fs*.01):floor(middle+fs*.01));
%         %formants = getLPC(sample,fs,4);
%         
%         %remove zero rows from the returned formants
%         mtxFormants( all(~mtxFormants,2), : ) = [];
%         
%         fMedian = [median(mtxFormants(:,1)) ...
%             median(mtxFormants(:,2)) median(mtxFormants(:,3))];
%         fMean = [median(mtxFormants(:,1)) ...
%             median(mtxFormants(:,2)) median(mtxFormants(:,3))];
%         
%         z = zeros([1 1]);
%         
%         % Remove zero rows
%         
%         
%         
%         fAvgavg = (fMean + fMedian) / 2;
%         
%         formants_actual(bar_count,:) = formants_actual(bar_count,:)+fAvgavg;
%         
%     end
%     if(bar_count==4)
%         bar_count=1;
%     else
%         bar_count=bar_count+1;
%     end
%     i=i+1;
% end

%%% JEROMES SHIT %%%
spectrogramFrmnts(wavFile, absolute_path, version);

% formants_actual = formants_actual./4;
% 
% score = formants_actual-formants_expected;   
% 
% fid = fopen('results.txt','w');
% fprintf(fid,'%f,%f,%f\r\n',score.');
% fid = fclose(fid);

exit

end

