param(
  [string[]]$ModelPaths = @("models/hf/modelo-a-base", "models/hf/modelo-b-coding", "models/hf/modelo-c-legal"),
  [double[]]$ModelWeights = @(0.5, 0.3, 0.2),
  [string]$PythonExe = "python",
  [string]$MergedDir = "models/corvinus-unico-merged",
  [string]$OutputGguf = "models/corvinus-unico-q4_k_m.gguf",
  [ValidateSet("q4_k_m", "q5_k_m", "q8_0", "q4_0")]
  [string]$QuantType = "q4_k_m",
  [string]$LlamaCppDir = "llama.cpp",
  [string]$OllamaModel = "corvinus-unico:latest",
  [switch]$SkipOllamaCreate
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$message) {
  Write-Host "[STEP] $message" -ForegroundColor Cyan
}

function Ensure-Command([string]$name, [string]$installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "No se encontro '$name'. $installHint"
  }
}

Write-Step "Validando archivos de entrada"
if ($ModelPaths.Count -lt 2) {
  throw "Debes indicar al menos 2 rutas de modelos en -ModelPaths"
}
if ($ModelPaths.Count -ne $ModelWeights.Count) {
  throw "La cantidad de elementos en -ModelPaths y -ModelWeights debe coincidir"
}

if ($ModelPaths[0] -eq "models/hf/modelo-a-base" -and -not (Test-Path $ModelPaths[0])) {
  throw "Debes reemplazar -ModelPaths con rutas reales o IDs de Hugging Face. Ejemplo: -ModelPaths google/gemma-2-2b-it google/gemma-2-2b"
}

Write-Step "Verificando dependencias (python)"
if (-not (Get-Command $PythonExe -ErrorAction SilentlyContinue) -and -not (Test-Path $PythonExe)) {
  throw "No se encontro Python en -PythonExe '$PythonExe'."
}

Write-Step "Ejecutando merge ponderado de modelos HF compatibles"
New-Item -ItemType Directory -Force -Path $MergedDir | Out-Null

$mergeArgs = @("scripts/weighted_merge_hf_models.py", "--models")
$mergeArgs += $ModelPaths
$mergeArgs += @("--weights")
$mergeArgs += ($ModelWeights | ForEach-Object { $_.ToString("0.################", [System.Globalization.CultureInfo]::InvariantCulture) })
$mergeArgs += @("--output_dir", $MergedDir, "--dtype", "float16")

& $PythonExe @mergeArgs
if ($LASTEXITCODE -ne 0) {
  throw "Fallo weighted_merge_hf_models.py con codigo $LASTEXITCODE"
}

Write-Step "Convirtiendo merged HF a GGUF y cuantizando"
& $PythonExe scripts/merge_and_export_gguf.py --skip_merge --merged_dir $MergedDir --output_gguf $OutputGguf --quant_type $QuantType --llama_cpp_dir $LlamaCppDir
if ($LASTEXITCODE -ne 0) {
  throw "Fallo merge_and_export_gguf.py con codigo $LASTEXITCODE"
}

if (-not $SkipOllamaCreate) {
  Write-Step "Registrando modelo en Ollama"
  Ensure-Command -name "ollama" -installHint "Instala Ollama desde https://ollama.com/download"

  $modelfilePath = Join-Path $env:TEMP ("Modelfile-" + ([guid]::NewGuid().ToString("N")) + ".txt")
  $ggufFullPath = (Resolve-Path $OutputGguf).Path
  $modelfileContent = @(
    "FROM $ggufFullPath",
    "PARAMETER num_ctx 4096",
    "PARAMETER temperature 0.2",
    "PARAMETER top_p 0.9"
  ) -join "`n"

  Set-Content -Path $modelfilePath -Value $modelfileContent -Encoding UTF8

  & ollama create $OllamaModel -f $modelfilePath
  if ($LASTEXITCODE -ne 0) {
    throw "Fallo ollama create con codigo $LASTEXITCODE"
  }

  Remove-Item $modelfilePath -Force -ErrorAction SilentlyContinue
  Write-Host "[OK] Modelo Ollama creado: $OllamaModel" -ForegroundColor Green
}

Write-Host "[OK] Pipeline completado" -ForegroundColor Green
Write-Host "     Merged HF: $MergedDir"
Write-Host "     GGUF:      $OutputGguf"
Write-Host "     Modelo:    $OllamaModel"
