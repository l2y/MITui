set wordId=%1
set version=%2

matlab -nodesktop -nosplash -minimize -r "cd 'C:\Users\Cain\workspace\MITui\research\segmentation'; run('classifier_score("%wordId%", "%version%")');exit"
