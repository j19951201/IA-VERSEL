$ErrorActionPreference = 'Continue'

$root = 'C:\Users\joanc\Downloads\Nueva carpeta (6)'
$source = Join-Path $root 'scripts\ia_juris_business_launcher.cs'
$logFile = Join-Path $root 'launcher_detailed.log'

function LogWrite {
  param([string]$msg)
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
  $line = "[$timestamp] $msg"
  Write-Output $line
  Add-Content -Path $logFile -Value $line -Encoding UTF8
}

try {
  LogWrite "[INIT] Iniciando compilacion..."

  if (-not (Test-Path $source)) {
    throw "Archivo fuente no encontrado: $source"
  }

  $code = Get-Content -Path $source -Raw -Encoding UTF8
  LogWrite "[INIT] Archivo fuente cargado ($(($code.Length / 1KB).ToString("N0")) KB)"

  LogWrite "[INIT] Compilando con Add-Type..."
  Add-Type `
    -ReferencedAssemblies @(
      'System.Windows.Forms.dll',
      'System.Drawing.dll',
      'System.Web.Extensions.dll',
      'System.Net.Http.dll'
    ) `
    -TypeDefinition $code `
    -Language CSharp `
    -WarningAction SilentlyContinue

  LogWrite "[OK] Compilacion exitosa"

  # Buscar tipos compilados
  $programType = $null
  $businessFormType = $null
  $businessDataType = $null

  LogWrite "[INIT] Buscando tipos compilados..."
  foreach ($asm in [AppDomain]::CurrentDomain.GetAssemblies()) {
    if (-not $programType) {
      $programType = $asm.GetType('Program', $false)
      if ($programType) { LogWrite "[OK] Tipo Program encontrado" }
    }
    if (-not $businessFormType) {
      $businessFormType = $asm.GetType('BusinessForm', $false)
      if ($businessFormType) { LogWrite "[OK] Tipo BusinessForm encontrado" }
    }
    if (-not $businessDataType) {
      $businessDataType = $asm.GetType('BusinessData', $false)
      if ($businessDataType) { LogWrite "[OK] Tipo BusinessData encontrado" }
    }
  }

  if (-not ($programType -and $businessFormType -and $businessDataType)) {
    throw "Tipos no encontrados: Program=$($programType -ne $null), BusinessForm=$($businessFormType -ne $null), BusinessData=$($businessDataType -ne $null)"
  }

  # Cargar configuracion
  $configPath = Join-Path (Split-Path $source) 'ia_juris_business_launcher.config.json'
  LogWrite "[INIT] Cargando config desde: $configPath"
  LogWrite "[INIT] Config existe: $(Test-Path $configPath)"

  $loadConfigMethod = $businessDataType.GetMethod('LoadConfig', [System.Reflection.BindingFlags]'Static,Public')
  if (-not $loadConfigMethod) {
    throw "LoadConfig no encontrado en BusinessData"
  }

  LogWrite "[INIT] Invocando LoadConfig..."
  $cfg = $loadConfigMethod.Invoke($null, @([string]$configPath))
  LogWrite "[OK] Config cargada: RefreshSeconds=$($cfg.RefreshSeconds), UsersReportUrl=$($cfg.UsersReportUrl)"

  # Preparar Application
  LogWrite "[INIT] Configurando Application.EnableVisualStyles()..."
  [System.Windows.Forms.Application]::EnableVisualStyles()
  [System.Windows.Forms.Application]::SetCompatibleTextRenderingDefault($false)
  LogWrite "[OK] Application configurada"

  # Crear instancia de BusinessForm
  LogWrite "[INIT] Creando instancia de BusinessForm..."
  $businessForm = $null
  try {
    $businessForm = [Activator]::CreateInstance($businessFormType, @([object]$cfg, [string]$configPath))
    LogWrite "[OK] BusinessForm creada (tipo: $($businessForm.GetType().FullName))"
  } catch {
    LogWrite "[ERROR] Error al crear BusinessForm: $($_.Exception.Message)"
    LogWrite "[STACK] $($_.Exception.StackTrace)"
    throw
  }

  if ($businessForm -eq $null) {
    throw "BusinessForm es null despues de CreateInstance"
  }

  LogWrite "[OK] BusinessForm es valido: Text=$($businessForm.Text), Size=$($businessForm.Width)x$($businessForm.Height)"

  # Ejecutar application
  LogWrite "[INIT] Ejecutando Application.Run()..."
  LogWrite "[INIT] Thread: $([System.Threading.Thread]::CurrentThread.ManagedThreadId), IsBackground: $([System.Threading.Thread]::CurrentThread.IsBackground)"
  
  try {
    [System.Windows.Forms.Application]::Run($businessForm)
    LogWrite "[OK] Application.Run() finalizado"
  } catch {
    LogWrite "[ERROR] Excepcion en Application.Run(): $($_.Exception.Message)"
    LogWrite "[STACK] $($_.Exception.StackTrace)"
    throw
  }

} catch {
  $errorMsg = $_.Exception.Message
  $errorStack = $_.Exception.StackTrace
  LogWrite "[FATAL] $errorMsg"
  LogWrite "[STACK] $errorStack"
  LogWrite "[FULL] $($_)"
}

LogWrite "[END] Script finalizado"
