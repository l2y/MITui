set "wordId=%1"
matlab -nodesktop -nosplash -minimize -r "cd 'C:\Users\Cain\workspace\MITui\research\segmentation'; run('classifier_score("%wordId%")');exit" 
rem matlab -nodesktop -nosplash -minimize -r "cd 'C:\Users\Sarah Kelly\Documents\University\SYDE 461\Code\Website\research\segmentation'; run('classifier_score("%wordId%")');exit" 
