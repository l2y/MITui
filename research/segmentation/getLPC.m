function [ formants ] = getLPC(y,fs, order)

w = hamming(length(y));
yw = y.*w;

formants = LPCInner(yw,fs,order);


end

function [formants] = LPCInner(y,fs,order)

LN = length(y);
freqn = fs*(0:round(LN/2))/LN;
pn = fs/1000 + order;
[an,gn] = lpc(y,pn);
lspecn = freqz(gn,an,freqn,fs);
lspecn = db(abs(lspecn));
%figure()
%plot(freqn,lspecn);
%xlabel('Frequency (Hz)');
%ylabel('Magnitude (dB)');
%xlim([0 5000]);
[~,locs] = findpeaks(lspecn); 
if length(locs) > 3
    if freqn(locs(1)) < 200
        formants = freqn(locs(2:4));
    else
        formants = freqn(locs(1:3));
    end
else    
    if length(locs) < 3 && order < 12
        formants = LPCInner(y,fs, order+2);
    else 
        formants = [0 0 0];
    end
end

if formants(1) > 1000
    if order < 12
        formants = LPCInner(y,fs, order+2);
    end
end

end

