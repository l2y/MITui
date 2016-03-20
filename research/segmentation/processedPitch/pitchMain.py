import os
import PitchTierReader

exe = "C:\\Users\\Cain\\Desktop\\Praat.exe"
script = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\pitchTierExtraction.praat"

helloWavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\Hello.wav"
howAreYouWavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\How Are You.wav"
iAmGoodWavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\I am Good.wav"
iLoveYouWavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\I Love You.wav"
iceCreamWavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\Ice Cream.wav"
thankYouWavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\Thank You.wav"
waterWavFile = "C:\\Users\\Cain\\Google Drive\\Uni\\4A\\SYDE461\\classifier\\Allan Singing" \
          "\\wav_website\\Water (higher pitch).wav"

helloPT = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\Hello.PitchTier"
howAreYouPT = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\How Are You.PitchTier"
iAmGoodPT = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\I am Good.PitchTier"
iLoveYouPT = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\I Love You.PitchTier"
iceCreamPT = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\Ice Cream.PitchTier"
thankYouPT = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\Thank You.PitchTier"
waterPT = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\Water.PitchTier"

ParsedHello = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\ParsedPitch Hello.txt"
ParsedHowAreYou = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\ParsedPitch How Are You.txt"
ParsedIAmGood = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\ParsedPitch I am Good.txt"
ParsedILoveYou = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\ParsedPitch I Love You.txt"
ParsedIceCream = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\ParsedPitch Ice Cream.txt"
ParsedThankYou = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\ParsedPitch Thank You.txt"
ParsedWater = "C:\\Users\\Cain\\workspace\\MITui\\research\\praat-pitch\\ParsedPitch Water.txt"

CommandHello = '{} --run {} "{}" "{}"'.format(exe, script, helloWavFile, helloPT)
CommandHowAreYou = '{} --run {} "{}" "{}"'.format(exe, script, howAreYouWavFile, howAreYouPT)
CommandIAmGood = '{} --run {} "{}" "{}"'.format(exe, script, iAmGoodWavFile, iAmGoodPT)
CommandILoveYou = '{} --run {} "{}" "{}"'.format(exe, script, iLoveYouWavFile, iLoveYouPT)
CommandIceCream = '{} --run {} "{}" "{}"'.format(exe, script, iceCreamWavFile, iceCreamPT)
CommandThankYou = '{} --run {} "{}" "{}"'.format(exe, script, thankYouWavFile, thankYouPT)
CommandWater = '{} --run {} "{}" "{}"'.format(exe, script, waterWavFile, waterPT)

os.system(CommandHello)
os.system(CommandHowAreYou)
os.system(CommandIAmGood)
os.system(CommandIceCream)
os.system(CommandILoveYou)
os.system(CommandThankYou)
os.system(CommandWater)

PitchEntriesHello = PitchTierReader.extractPitchTier(helloPT)[3]
PitchEntriesHowAreYou = PitchTierReader.extractPitchTier(howAreYouPT)[3]
PitchEntriesIAmGood = PitchTierReader.extractPitchTier(iAmGoodPT)[3]
PitchEntriesIceCream = PitchTierReader.extractPitchTier(iceCreamPT)[3]
PitchEntriesILoveYou = PitchTierReader.extractPitchTier(iLoveYouPT)[3]
PitchEntriesThankYou = PitchTierReader.extractPitchTier(thankYouPT)[3]
PitchEntriesWater = PitchTierReader.extractPitchTier(waterPT)[3]

outputs = [(ParsedHello, PitchEntriesHello),
           (ParsedHowAreYou, PitchEntriesHowAreYou),
           (ParsedIAmGood, PitchEntriesIAmGood),
           (ParsedIceCream, PitchEntriesIceCream),
           (ParsedILoveYou, PitchEntriesILoveYou),
           (ParsedThankYou, PitchEntriesThankYou),
           (ParsedWater, PitchEntriesWater)]

for i, v in outputs:
    f = open(i, 'w')
    for entry in v:
        f.write(entry[0] + " " + entry[1] + "\n")





