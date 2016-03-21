function[out] = envelopeseg(y,fs,winSz)
    r = 4;
    if fs == 44100
        y = decimate(y,r);
        fs = fs/r;
    end
    
    fNy = fs/2;
    
    yrect = abs(y);
    [B,A] = butter(2, 40/fNy);
    fenv = normalizesig(filtfilt(B,A,yrect),0,1);
    
    %winSz = (1.5e4 / 4);
    out = rolVarWin(fenv,winSz);
end