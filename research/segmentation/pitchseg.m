%fs here is desired FS
function[rwinvec] = pitchseg(ypitch,t,fs,L,winSz)
    
    % do kernel estimation before  the resampling process
    [pitch,upitches] = kerneltrim(ypitch);
    [pitchrs,tr] = resample(pitch,t,fs,'linear');
    
    % length of fenvelope is just L
    
    
    if abs(length(pitchrs) - L) > 0
        minL = min(length(pitchrs),L);
        pitchrs = pitchrs(1:minL);
        tr = tr(1:minL);
        %fEnv = fEnv(1:minL); 
    end
    rwinvec = rolVarWin(pitchrs,winSz);
end