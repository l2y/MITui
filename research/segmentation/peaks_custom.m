function [ pks_out, lcs_out ] = peaks( pks_in, lcs_in )

len = length(pks_in);
i = 1;
pks_out = [];
lcs_out = [];

while(i<(len-1))
    y = i-1;
    local_max = 1;
    pk = pks_in(i);
    break_flag = 0;
    while(y>0 && ~break_flag)
        if((lcs_in(i)-lcs_in(y))>5512)
            break_flag = 1;
        end
        if(pks_in(y)>pk && ~break_flag)
            local_max = 0;
            break_flag = 1;
        end
        y = y-1;
    end
    y = i+1;
    break_flag = 0;
    while(y<(len-1) && ~break_flag)
        if((lcs_in(y)-lcs_in(i))>5512)
            break_flag = 1;
        end
        if(pks_in(y)>pk && ~break_flag)
            local_max = 0;
            break_flag = 1;
        end
        y = y+1;
    end
    if(local_max)
        pks_out = [pks_out pks_in(i)];
        lcs_out = [lcs_out lcs_in(i)];
    end
    i = i+1;
end

end

