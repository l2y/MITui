function [rwinvec2resample] = rolVarWin (input,wlen)
    if mod(wlen,2) == 1
        wlen = wlen+1;
    end
 
    if mod(input,2) == 1
        input = [input input(length(input))];
    end
    
    L = length(input);
%     tic
%     rwinvec = zeros([1 L-wlen]);
%     for t = 1:L-wlen
%         rwinvec(t) = var(input(t:t+wlen));
%     end
%     toc
    
    R = 100;
    L2 = floor((L-wlen)/R);
    
    %rwinvec2 = zeros([1 round(L-wlen/4)+4]);
    rwinvec2 = zeros([1 L2]);
    for t = 1:L2
        rwinvec2(t) = var(input((R*t:(R*t)+wlen)));
    end
    
    %some jankiness is introduced in the resampling stage @ start
    % of the signal due to its "rapid entrance" 
    % try and filter it out; it looks super high freq.
    [bb,aa] = butter(4,0.001);
    rwinvec2resample = filtfilt(bb,aa,resample(rwinvec2,R,1));


%      rwinvec = [zeros([1 wlen/2]) rwinvec zeros([1 wlen/2])];
    
    diff = abs(length(rwinvec2resample) - length(input));
    rwinvec2resample = [zeros([1 (diff/2)+R]) rwinvec2resample zeros([1 (diff/2)-R])];
    
    
    
%     figure()
%     plot(rwinvec2resample)
%     hold on
%     plot(rwinvec)
%     
end