Add-Type -AssemblyName System.IO.Compression.FileSystem

$modsPath = "C:\Users\" + [Environment]::UserName + "\OneDrive\Apps\Curse OneDrive Updater Daemon\mods"
$tempPath = "C:\Users\" + [Environment]::UserName + "\OneDrive\Apps\Curse OneDrive Updater Daemon\temp"
$wowPath = "C:\Program Files (x86)\World of Warcraft\Interface\AddOns"
if(Test-Path $tempPath) {
    Remove-Item ($tempPath + '\*') -recurse
}
Get-ChildItem $modsPath  -Filter *.zip | `
Foreach-Object{
    [System.IO.Compression.ZipFile]::ExtractToDirectory($_.FullName, $tempPath)
}
Copy-Item ($tempPath + '\*') $wowPath -Recurse -Force