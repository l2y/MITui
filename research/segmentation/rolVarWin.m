function [rwinvec] = rolVarWin (input,wlen)
    if mod(wlen,2) == 1
        wlen = wlen+1;
    end
 
    if mod(input,2) == 1
        input = [input input(length(input))];
    end
    
    L = length(input);
    rwinvec = zeros([1 L-wlen]);
    
    for t = 1:L-wlen
        rwinvec(t) = var(input(t:t+wlen));
    end   
    rwinvec = [zeros([1 wlen/2]) rwinvec zeros([1 wlen/2])];
end