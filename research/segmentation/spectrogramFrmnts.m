%% the purpose of this function is to create a spectrogram
% along with the formants.
function [a] = spectrogramFrmnts(stFilename, parsedPitch)
    % downsample
    [y,fs] = audioread(stFilename);
    
    s = size(y);
    if s(2) == 2
    y = (y(:,1)+y(:,2))/2;
    end
    
    r = 4;
    y = decimate(y,r);
    fs = fs/r;
    fNy = fs/2;
    
    N = 1024;
    w = hamming(N);
    olap = N-16;
    figure();
    [s,f,t] = spectrogram(y,w,olap,N,fs);
    clims = [-70 25];
    fig = figure(1);
    imagesc(t,f,db(abs(s)),clims);
    colormap(flipud(gray));
    axis xy;
    
    L = (length(y) - (fs*0.015))/100;
    mtxFormants = zeros(length(L),3);
    sampleRanges = zeros(length(L),2);
    
    c = 1;
    while c < L 
        % how many samples are we going to take? 
        n1 = floor(c*100);
        n2 = floor((c*100 + (fs*0.015)));
        
        sample = y(n1:n2);
        mtxFormants(c,:) = getLPC(sample,fs,4); 
        sampleRanges(c,:) = [n1 n2];
        
        c = c+1;
    end
    
    winLoc = (sampleRanges(:,1) + sampleRanges(:,2))/2;
    %convert winLoc to time for graph display.
    winLoc = winLoc / fs;
    
    hold on
    scatter(winLoc,mtxFormants(:,1),'filled');
    scatter(winLoc,mtxFormants(:,2),'filled');
    scatter(winLoc,mtxFormants(:,3),'filled');
    
    hold off
    
    %we also want to draw the segmentation lines over time.
    
    %envseg:
    winSz = (1.5e4 / 4);
    envelopevar = envelopeseg(y,fs,winSz);
    
    fileId = fopen([parsedPitch],'r');
    formatSpec = '%f %f';
    sizeA = [2 Inf];   
    A = fscanf(fileId,formatSpec,sizeA);
    fclose(fileId);
    t = A(1,:);
    pitch = A(2,:);
    
    % normalize the pitch:
    t = [0 t (length(envelopevar))/fs];
    pitch = [pitch(1) pitch pitch(length(pitch))];
    
    pitchvar = pitchseg(pitch,t,fs,length(envelopevar),winSz);
    
    [pks_in,lcs_in] = findpeaks(envelopevar+pitchvar);
    [~,lcs] = peaks_custom(pks_in,lcs_in);
    
    hold on
    clrPnk = [1 0.5 0.5];
    for cnt = 1:length(lcs)
        tCurr = lcs(cnt) / fs;
        line([tCurr tCurr], [0 5000], 'Color',clrPnk,'LineWidth',2);
    end
    
    xlabel('Time (sec)');
    ylabel('Frequency (Hz)');
    ylim([0 5000]);
    
    saveas(gcf, ['spectrogram_' stFilename], 'jpg');
    
   
end