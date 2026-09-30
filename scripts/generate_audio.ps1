Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Sélectionner la voix française (Hortense)
$frVoice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like "fr*" } | Select-Object -First 1
if ($frVoice) {
    $synth.SelectVoice($frVoice.VoiceInfo.Name)
    Write-Host "Voix sélectionnée : $($frVoice.VoiceInfo.Name)"
}

$dest = Join-Path $PSScriptRoot "..\public\test_voice.wav"
$synth.SetOutputToWaveFile($dest)
$synth.Speak("Ticket D 0 0 1, veuillez passer à la caisse 2")
$synth.Dispose()

Write-Host "Fichier audio généré avec succès dans : $dest"
