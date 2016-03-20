function [x] = normalizesig(x,newmin,newmax)
    cmax = max(x);
    cmin = min(x);    
    a = (newmax-newmin)/(cmax-cmin);
    b = (newmax - a*cmax);
    
    x = a*x + b;
end
