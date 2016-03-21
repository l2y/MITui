import os
import sys
import PitchTierReader

exe = "C:\\Users\\Cain\\Desktop\\Praat.exe"
script = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\pitchTierExtraction.praat"

wavFile = sys.argv[1]
PTOutput = sys.argv[2]
ParsedOutput = sys.argv[3]

os.system('{} --run {} "{}" "{}"'.format(exe, script, wavFile, PTOutput))

PitchEntries = PitchTierReader.extractPitchTier(PTOutput)[3]

outputs = [(ParsedOutput, PitchEntries)]

for i, v in outputs:
    f = open(i, 'w')
    for entry in v:
        f.write(entry[0] + " " + entry[1] + "\n")
        