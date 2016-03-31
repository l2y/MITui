set wordId=%1
set version=%2
set recordingCount=%3

matlab -nodesktop -nosplash -minimize -r -noFigureWindows "cd 'C:\Users\Cain\workspace\MITui\research\segmentation'; run('classifier_score("%wordId%", "%version%", "%recordingCount%")');exit"
