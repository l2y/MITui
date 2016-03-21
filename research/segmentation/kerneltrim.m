function [pitch,upitches] = kerneltrim(pitch)
     % estimate kernel
    pd2 = fitdist(pitch','Kernel');
    xp = (0:0.001:1);   % 1/1000th of the pitch range we normalized
    ypd2 = pdf(pd2,xp);
    ycd2 = cdf(pd2,xp);
    [pks,idx] = findpeaks(ypd2);
    umaxidx = 0;
    upitches = [];
    for i = 1:length(pks)
        if pks(i) > 2.5
            umaxidx = idx(i);
            upitches = [upitches idx(i)];
        end
    end
    
    threshidx = find(ycd2>0.95,1);
    
    pitch(pitch>(threshidx/1000)) = umaxidx/1000;
end