$ErrorActionPreference = 'SilentlyContinue'
$hubRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$runtime = Join-Path $hubRoot '.sites-runtime\hub-pids.json'
if (-not (Test-Path $runtime)) { exit 0 }
$records = Get-Content $runtime -Raw | ConvertFrom-Json
foreach ($record in @($records)) {
  $proc = Get-Process -Id ([int]$record.pid) -ErrorAction SilentlyContinue
  if (-not $proc) { continue }
  $command = (Get-CimInstance Win32_Process -Filter ("ProcessId = {0}" -f $record.pid)).CommandLine
  if ($command -and $command -like ('*' + $record.marker + '*')) { Stop-Process -Id ([int]$record.pid) -Force }
}
Remove-Item $runtime -Force
