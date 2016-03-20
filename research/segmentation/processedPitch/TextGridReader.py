import re
from pprint import pprint

with open("Water__higher_pitch_.Pitch") as file:
    lines = file.read().split("\n")

headers = lines[0:10]
lines = lines[10:]

xmin = 0
xmax = 0

frameFrequencies = []

for line in headers:
    if "xmin" in line:
        xmin = re.compile("\d*\.?\d+").findall(line)[0]
    if "xmax" in line:
        xmax = re.compile("\d*\.?\d+").findall(line)[0]

for i in range(0, len(lines)):
    if "intensity" in lines[i]:
        if float(re.compile("\d*\.?\d+").findall(lines[i])[0]) > 0.01:
            i += 1
            if "nCandidates" in lines[i]:
                nCandidates = int(re.compile("\d*\.?\d+").findall(lines[i])[0])
                i += 3
                frequencies = []
                while len(frequencies) < nCandidates:
                    if "frequency" in lines[i]:
                        frequency = float(re.compile("\d*\.?\d+").findall(lines[i])[0])
                        if 95 < frequency < 150:
                            i += 1
                            strength = float(re.compile("\d*\.?\d+").findall(lines[i])[0])
                            frequencies.append([frequency, strength])
                    i += 1
                maxStrength = 0
                maxFrequency = 0
                for freq in frequencies:
                    if freq[1] > maxStrength:
                        maxFrequency = freq[0]
                        maxStrength = freq[1]
                frameFrequencies.append([maxFrequency, maxStrength])
        else:
            frameFrequencies.append([])


print(xmin)
print(xmax)
print(len(frameFrequencies))

i = 0
for freq in frameFrequencies:
    print(str(i) + " " + str(freq))
    i += 1

i = 0
while i < len(frameFrequencies):
    begin = 0
    end = 0
    if frameFrequencies[i]:
        begin = i
        i += 1
        while frameFrequencies[i]:
            i += 1
        end = i
        print("begin: " + str(begin) + " end: " + str(end))
    i += 1

