$ErrorActionPreference = 'Stop'

$root = 'C:\Users\joanc\Downloads\Nueva carpeta (6)'
$source = Join-Path $root 'scripts\ia_juris_business_launcher.cs'

if (-not (Test-Path $source)) {
  throw "No se encontro el archivo fuente: $source"
}

$code = Get-Content -Path $source -Raw -Encoding UTF8

$refs = @(
    [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms').Location,
    [System.Reflection.Assembly]::LoadWithPartialName('System.Drawing').Location,
    [System.Reflection.Assembly]::LoadWithPartialName('System.Web.Extensions').Location,
    [System.Reflection.Assembly]::LoadWithPartialName('System.ComponentModel.Primitives').Location
  ) | Where-Object { $_ -and (Test-Path $_) }

Add-Type `
  -ReferencedAssemblies $refs `
  -TypeDefinition $code `
  -Language CSharp

$type = [Type]::GetType('Program')
if (-not $type) {
  foreach ($asm in [AppDomain]::CurrentDomain.GetAssemblies()) {
    $candidate = $asm.GetType('Program', $false)
    if ($candidate) {
      $type = $candidate
      break
    }
  }
}

if (-not $type) {
  throw 'No se pudo resolver el tipo Program del launcher comercial.'
}

$flags = [System.Reflection.BindingFlags]'Static, NonPublic'
$main = $type.GetMethod('Main', $flags)
if (-not $main) {
  throw 'No se pudo resolver Program.Main.'
}

[void]$main.Invoke($null, $null)
