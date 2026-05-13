$ErrorActionPreference = "Stop"

$model = "corvinus-x-ip:latest"
$manifestPath = "C:\Users\joanc\.ollama\models\manifests\registry.ollama.ai\library\corvinus-x-ip\latest"

if (-not (Test-Path $manifestPath)) {
  throw "No se encontro manifiesto para $model"
}
if (-not (Test-Path "D:\")) {
  throw "No existe el disco D:"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$destRoot = "D:\OllamaBackup\corvinus-x-$stamp"
$destModel = Join-Path $destRoot "corvinus-x-ip_latest"
$destBlobs = Join-Path $destModel "blobs"

New-Item -ItemType Directory -Path $destBlobs -Force | Out-Null
Copy-Item $manifestPath (Join-Path $destModel "manifest-latest.json") -Force

$mf = Get-Content $manifestPath -Raw | ConvertFrom-Json
$digests = @()
if ($mf.config.digest) { $digests += $mf.config.digest }
$digests += ($mf.layers | ForEach-Object { $_.digest })
$digests = $digests | Where-Object { $_ } | Select-Object -Unique

$blobSrcRoot = "C:\Users\joanc\.ollama\models\blobs"
$copied = @()
$missing = @()

foreach ($d in $digests) {
  $hash = $d -replace "^sha256:", ""
  $src = Join-Path $blobSrcRoot ("sha256-" + $hash)
  $dst = Join-Path $destBlobs ("sha256-" + $hash)

  if (Test-Path $src) {
    Copy-Item $src $dst -Force
    $copied += $dst
  }
  else {
    $missing += $src
  }
}

[pscustomobject]@{
  model = $model
  backupRoot = $destRoot
  manifest = (Join-Path $destModel "manifest-latest.json")
  blobsCopied = $copied.Count
  blobsMissing = $missing.Count
} | ConvertTo-Json | Set-Content -Path (Join-Path $destRoot "backup-summary.json") -Encoding UTF8

if ($missing.Count -gt 0) {
  Write-Host "BACKUP_WITH_MISSING_BLOBS"
  $missing | ForEach-Object { Write-Host "MISSING: $_" }
}
else {
  Write-Host "BACKUP_OK"
}

Write-Host "BACKUP_PATH:$destRoot"

ollama rm $model | Out-Null
Write-Host "REMOVE_OK"
