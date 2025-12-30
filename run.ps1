param(
	[switch]$Reload,
	[int]$Workers = 1
)

# 嘗試尋找 venv 的 python
$venvPython = Join-Path -Path $PSScriptRoot -ChildPath "./.venv/Scripts/python.exe"
$useVenv = $false
if (Test-Path $venvPython) {
	$pythonCmd = $venvPython
	$useVenv = $true
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
	$pythonCmd = "python"
} else {
	Write-Host "找不到 Python 執行檔，請先安裝 Python 或建立虛擬環境 (.venv)！" -ForegroundColor Red
	exit 1
}

$backendPath = "Backend"
Push-Location $backendPath

# 檢查 uvicorn 是否已安裝
$checkUvicorn = & $pythonCmd -m pip show uvicorn 2>$null
if (-not $checkUvicorn) {
	Write-Host "找不到 uvicorn，請先安裝：$pythonCmd -m pip install uvicorn" -ForegroundColor Yellow
	Pop-Location
	exit 1
}

$cmd = "$pythonCmd -m uvicorn main:app"
if ($Reload) {
	$cmd += " --reload"
}
if ($Workers -gt 1) {
	$cmd += " --workers $Workers"
}

Write-Host "執行: $cmd"
Invoke-Expression $cmd

Pop-Location