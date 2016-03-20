import os
import PitchTierReader

exe = "C:\\Users\\Cain\\Desktop\\Praat.exe"
script = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\pitchTierExtraction.praat"

wavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\Water (higher pitch).wav"
comparisonFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\Thank You.wav"
outputFile = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\output.PitchTier"
baseOutputFile = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\baseOutput.PitchTier"

outputParsedFile = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\outputParsed.txt"
baseOutputParsedFile = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\baseOutputParsed.txt"

outputCommand = '{} --run {} "{}" "{}"'.format(exe, script, wavFile, outputFile)
baseCommand = '{} --run {} "{}" "{}"'.format(exe, script, comparisonFile, baseOutputFile)

os.system(outputCommand)
os.system(baseCommand)

[xmin, xmax, numPoints, pitchEntries] = PitchTierReader.extractPitchTier(outputFile)
[baseXmin, baseXmax, baseNumPoints, basePitchEntries] = PitchTierReader.extractPitchTier(baseOutputFile)

f = open(outputParsedFile, 'w')
for entry in pitchEntries:
    f.write(entry[0] + " " + entry[1] + "\n")





