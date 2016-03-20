% idiot gaussian window attempt

clear all
close all
fileID = fopen('howareyoupitch.txt','r');
formatSpec = '%f %f';
sizeA = [2 Inf];

A = fscanf(fileID,formatSpec,sizeA);
fclose(fileID);

t = A(1,:);
pitch = A(2,:);

% normalize pitch to 0 and 1?
pitch = normalizesig(pitch,0,1);


w = gausswin(20,8)';
out = conv(pitch,w,'same');
w2 = gausswin(70,8)';
out2 = conv(pitch,w2,'same');
o2s = smooth(out2,100)';

plot(t,out);
hold on;
plot(t,pitch);
plot(t,out2);
plot(t,o2s);

legend('conv. with 20 sample gaussian, std. 8', ...
    'original pitch signal', ...
    'conv. with 70 sample gaussian, std. 8', ...
    'conv. with 70 sample gaussian SMOOTHED');