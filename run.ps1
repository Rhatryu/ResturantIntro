# PowerShell 啟動 FastAPI (Uvicorn) 支援 reload/workers 參數
param(
	[switch]$Reload,
	[int]$Workers = 1
)

$backendPath = "Backend"
Push-Location $backendPath

$cmd = "uvicorn main:app"
if ($Reload) {
	$cmd += " --reload"
}
if ($Workers -gt 1) {
	$cmd += " --workers $Workers"
}

Write-Host "執行: $cmd"
Invoke-Expression $cmd

Pop-Location
