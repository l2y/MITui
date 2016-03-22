set "wordId=%1"

matlab -nodesktop -nosplash -minimize -r "cd 'C:\Users\Cain\workspace\MITui\research\segmentation'; run('classifier_score_shitty("%wordId%")');exit" 