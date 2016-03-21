set wavInput=%1
set pitchTierOutput=%2
set parsedPitchOutput=%3

matlab -nodesktop -nosplash -minimize -r "cd C:\Users\Cain\workspace\MITui; run('M FILE GOES HERE'); exit;"
python C:\Users\Cain\workspace\MITui\research\praat-pitch\perWavPitch.py %1 %2 %3
