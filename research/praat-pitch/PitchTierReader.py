import re


def extractPitchTier(pitchTierFile):
    with open(pitchTierFile) as input:
        lines = input.read()

    lineSplit = lines.split("\n")
    headers = lineSplit[0:6]

    xmin = 0
    xmax = 0
    numPoints = 0

    pitchEntries = []

    for line in headers:
        if "xmin" in line:
            xmin = re.compile("\d*\.?\d+").findall(line)[0]
        if "xmax" in line:
            xmax = re.compile("\d*\.?\d+").findall(line)[0]
        if "points" in line:
            numPoints = re.compile("\d*\.?\d+").findall(line)[0]

            values = re.findall("value = \d.* ", lines)
            times = re.findall("number = \d.* ", lines)
            for i in range(0, len(values)):
                value = (re.compile("\d*\.?\d+").findall(values[i])[0])
                time = (re.compile("\d*\.?\d+").findall(times[i])[0])

                pitchEntries.append([time, value])

    return [xmin, xmax, numPoints, pitchEntries]


