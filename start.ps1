$ErrorActionPreference = 'SilentlyContinue'
$hubRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $hubRoot
$runtime = Join-Path $hubRoot '.sites-runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
$records = @()

function Test-WebPort([int]$port, [string]$path = '/') {
  try { Invoke-WebRequest -UseBasicParsing -Uri ("http://127.0.0.1:{0}{1}" -f $port, $path) -TimeoutSec 1 | Out-Null; return $true } catch { return $false }
}
function Start-Preview([string]$name, [string]$cwd, [string]$file, [string[]]$args, [int]$port, [string]$checkPath = '/') {
  if (Test-WebPort $port $checkPath) { return }
  $proc = Start-Process -FilePath $file -ArgumentList $args -WorkingDirectory $cwd -WindowStyle Hidden -PassThru
  $script:records += [pscustomobject]@{ name=$name; pid=$proc.Id; port=$port; marker=$cwd }
  Start-Sleep -Milliseconds 500
}

# Flightlab is the only lab with a small runtime server; the other two are static previews.
Start-Preview 'Flightlab' (Join-Path $projectRoot 'flightlab') 'node' @('server.mjs') 4317 '/api/health'
Start-Preview 'RESTcraft' (Join-Path $projectRoot 'restcraft') 'python' @('-m','http.server','4321','--directory',(Join-Path $projectRoot 'restcraft\dist')) 4321
Start-Preview 'SystemForge' (Join-Path $projectRoot 'systemforge') 'python' @('-m','http.server','4322','--directory',(Join-Path $projectRoot 'systemforge\dist')) 4322
Start-Preview 'InterviewOS hub' $hubRoot 'python' @('-m','http.server','4330','--directory',(Join-Path $hubRoot 'dist')) 4330

$records | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $runtime 'hub-pids.json')
Start-Process 'http://127.0.0.1:4330/'
