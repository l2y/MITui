function [rwinvec] = rolVarWin (input,wlen)
    if mod(wlen,2) == 1
        wlen = wlen+1;
    end
    
    if mod(input,2) == 1
        input = [input input(length(input))];
    end
    
    L = length(input);
    rwinvec = zeros([L-wlen 1]);
    
    for t = 1:L-wlen
        rwinvec(t) = var(input(t:t+wlen));
    end
    
    rwinvec = [zeros([wlen/2 1])' rwinvec' zeros([wlen/2 1])'];
end