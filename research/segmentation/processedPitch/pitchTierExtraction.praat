Erase all

form Test command line calls
	sentence Input C:\Users\Cain\Google Drive\Uni\4A\SYDE461\classifier\Allan Singing\wav_website\Water (higher pitch).wav
	sentence Output C:\Users\Cain\Google Drive\Uni\4A\SYDE461\classifier\Allan Singing\wav_website\Water (higher pitch).PitchTier
endform

sound = Read from file: input$
selectObject: sound
pitch = To Pitch: 0.0, 75, 280

selectObject: pitch
Down to PitchTier
Save as text file: output$