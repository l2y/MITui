function [ formants ] = getLPC(y,fs, order)

%r = 4;                      % decimation factor
%y10k = decimate(y,r);
y10k = y;
fsn = fs;                 % 11025 Hz
LN = length(y10k);
freq = fs*(0:round(LN/2))/LN;
w = hamming(LN);
y10k = y10k.*w;
freqn = fsn*(0:round(LN/2))/LN;
pn = fsn/1000 + order;
[an,gn] = lpc(y10k,pn);
lspecn = freqz(gn,an,freqn,fsn);
lspecn = db(abs(lspecn));
%figure()
%plot(freqn,lspecn);
%xlabel('Frequency (Hz)');
%ylabel('Magnitude (dB)');
%xlim([0 5000]);
[~,locs] = findpeaks(lspecn); 
if length(locs) > 3
    if freqn(locs(1)) < 200
        formants = freq(locs(2:4));
    else
        formants = freq(locs(1:3));
    end

else
    formants = freq(locs(1:3));
end

if formants(1) > 1000
    if order < 12
        formants = getLPC(y,fs, order+2);
    end
end

end

