
%segmentation
%requires input signal and fs. 
%if fs == 44100, decimate to 11025.
function [fo,t,upitches] = segmentation(y,fs)
    r = 4;    
    if fs == 44100
        y = decimate(y,r);
        fs = fs/r;
    end
    
    fNy = fs/2;
    
    winSz = (1.5e4/4);
    
    %get envelope segmentation signal
    envseg = envelopeseg(y,fs,winSz);
    
    % need to create standard format for reading in a file...
    
    fileId = fopen('./processedPitch/ParsedPitch I am Good.txt','r');
    formatSpec = '%f %f';
    szA = [2 Inf];
    A = fscanf(fileId,formatSpec,szA);
    
    t = A(1,:);
    pitch = normalizesig(A(2,:),0,1);
    
    t = [0 t (length(envseg))/fs];
    pitch = [pitch(1) pitch pitch(length(pitch))];
    
    [pitch,upitches] = kerneltrim(pitch);
    
    %resample, pitchseg
    %ptcseg = pitchseg(pitch,t,fs,
    [ptcseg,envseg] = pitchseg(pitch,t,fs,envseg,winSz);
    
    % sum curve
    [bb,aa] = butter(4,0.2);
    fo = filtfilt(bb,aa,ptcseg+envseg);
end