fileID = fopen('outputParsed.txt','r');
formatSpec = '%f %f';
sizeA = [2 Inf];

A = fscanf(fileID,formatSpec,sizeA);
fclose(fileID);

t = A(1,:);
pitch = A(2,:);

scatter(t,pitch);
