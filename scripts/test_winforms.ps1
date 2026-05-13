$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Write-Output "[TEST] Creando ventana de prueba..."

$form = New-Object System.Windows.Forms.Form
$form.Text = "Control Comercial - Test"
$form.Width = 600
$form.Height = 400
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::CenterScreen

$label = New-Object System.Windows.Forms.Label
$label.Text = "Launcher cargando... Espera un momento..."
$label.Dock = [System.Windows.Forms.DockStyle]::Fill
$label.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$label.Font = New-Object System.Drawing.Font("Arial", 14)
$form.Controls.Add($label)

Write-Output "[TEST] Mostrando ventana..."
[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::Run($form)
Write-Output "[TEST] Ventana cerrada"
