$ErrorActionPreference = 'Stop'

$root = 'C:\Users\joanc\Downloads\Nueva carpeta (6)'
$source = Join-Path $root 'scripts\ia_juris_business_launcher.cs'
$output = Join-Path $root 'scripts\ControlComercial_LOCAL.exe'
$logFile = Join-Path $root 'launcher_error.log'

function LogWrite {
  param([string]$msg)
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$timestamp] $msg"
  Write-Output $line
  Add-Content -Path $logFile -Value $line -Encoding UTF8
}

try {
  LogWrite "[*] Compilando launcher comercial desde: $source"

  if (-not (Test-Path $source)) {
    throw "Archivo fuente no encontrado: $source"
  }

  $code = Get-Content -Path $source -Raw -Encoding UTF8

  LogWrite "[*] Agregando ensamblados..."
  Add-Type `
    -ReferencedAssemblies @(
      'System.Windows.Forms.dll',
      'System.Drawing.dll',
      'System.Web.Extensions.dll',
      'System.Net.Http.dll'
    ) `
    -TypeDefinition $code `
    -Language CSharp `
    -ErrorAction Stop

  LogWrite "[+] Compilacion exitosa en memoria"

  # Obtener el tipo Program
  $type = $null
  foreach ($asm in [AppDomain]::CurrentDomain.GetAssemblies()) {
    $candidate = $asm.GetType('Program', $false)
    if ($candidate) {
      $type = $candidate
      LogWrite "[+] Tipo Program encontrado"
      break
    }
  }

  if ($type) {
    # Buscar BusinessForm
    $businessFormType = $null
    foreach ($asm in [AppDomain]::CurrentDomain.GetAssemblies()) {
      $candidate = $asm.GetType('BusinessForm', $false)
      if ($candidate) {
        $businessFormType = $candidate
        LogWrite "[+] Tipo BusinessForm encontrado"
        break
      }
    }
    
    # Buscar BusinessData
    $businessDataType = $null
    foreach ($asm in [AppDomain]::CurrentDomain.GetAssemblies()) {
      $candidate = $asm.GetType('BusinessData', $false)
      if ($candidate) {
        $businessDataType = $candidate
        LogWrite "[+] Tipo BusinessData encontrado"
        break
      }
    }
    
    if ($businessFormType -and $businessDataType) {
      LogWrite "[*] Cargando configuracion..."
      $configDir = Split-Path -Parent $source
      $configPath = Join-Path $configDir 'ia_juris_business_launcher.config.json'
      
      LogWrite "[*] Ruta de config: $configPath"
      LogWrite "[*] Config existe: $(Test-Path $configPath)"
      
      $loadConfigMethod = $businessDataType.GetMethod('LoadConfig', [System.Reflection.BindingFlags]'Static,Public')
      if (-not $loadConfigMethod) {
        throw "LoadConfig metodo no encontrado en BusinessData"
      }
      
      LogWrite "[*] Invocando LoadConfig con path: $configPath"
      $cfg = $loadConfigMethod.Invoke($null, @([string]$configPath))
      LogWrite "[+] Configuracion cargada exitosamente"
      LogWrite "[*] Tipo de config: $($cfg.GetType().FullName)"
      
      LogWrite "[*] Configurando Application..."
      [System.Windows.Forms.Application]::EnableVisualStyles()
      [System.Windows.Forms.Application]::SetCompatibleTextRenderingDefault($false)
      
      LogWrite "[*] Creando BusinessForm..."
      $businessForm = [Activator]::CreateInstance($businessFormType, @([object]$cfg, [string]$configPath))
      LogWrite "[+] BusinessForm creada"
      LogWrite "[*] Tipo de businessForm: $($businessForm.GetType().FullName)"
      LogWrite "[*] businessForm es null: $($businessForm -eq $null)"
      
      LogWrite "[*] Ejecutando Application.Run()..."
      try {
        [System.Windows.Forms.Application]::Run($businessForm)
        LogWrite "[+] Application.Run() finalizado sin excepciones"
      } catch {
        LogWrite "[ERROR] Excepcion en Application.Run(): $($_.Exception.Message)"
        LogWrite "[STACK] $($_.Exception.StackTrace)"
        throw
      }
      
      LogWrite "[+] Aplicacion finalizada normalmente"
    } else {
      $msg = "Tipos no encontrados - BusinessForm: $($businessFormType -ne $null), BusinessData: $($businessDataType -ne $null)"
      LogWrite "[ERROR] $msg"
      throw $msg
    }
  } else {
    throw "Tipo Program no encontrado despues de compilacion"
  }
} catch {
  $errorMsg = $_.Exception.Message
  $errorStack = $_.Exception.StackTrace
  LogWrite "[ERROR] $errorMsg"
  LogWrite "[STACK] $errorStack"
  LogWrite "[ERROROBJ] $($_)"
}

