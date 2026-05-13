param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,

  [string]$Token = "",

  [string]$Model = "corvinus-unico:latest"
)

$ErrorActionPreference = "Stop"

$cleanBase = $BaseUrl.Trim().TrimEnd("/")
$healthUrl = "$cleanBase/health"
$generateUrl = "$cleanBase/api/generate"

Write-Host "[INFO] Probando health: $healthUrl"
$health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 20
Write-Host ("[OK] health => " + ($health | ConvertTo-Json -Compress))

$headers = @{}
if ($Token) {
  $headers["Authorization"] = "Bearer $Token"
}

$body = @{
  model = $Model
  prompt = "Responde SOLO ROUTER_ENDPOINT_OK"
  stream = $false
} | ConvertTo-Json

Write-Host "[INFO] Probando generate: $generateUrl"
$response = Invoke-RestMethod -Uri $generateUrl -Method Post -Headers $headers -ContentType "application/json" -Body $body -TimeoutSec 60

$text = [string]($response.response)
Write-Host ("[OK] generate len=" + $text.Length)
Write-Host ("[OK] generate text=" + ($text -replace "`r?`n", " "))
