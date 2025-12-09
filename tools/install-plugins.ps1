$ErrorActionPreference = "Stop"

# 配置路径
$ToolsDir = $PSScriptRoot
$PluginSource = Join-Path $ToolsDir "dita-plugins\com.chefos.pdf"
$Java17Path = Join-Path $ToolsDir "java-17\bin\java.exe"

# 检查插件源是否存在
if (-not (Test-Path $PluginSource)) {
    Write-Error "Plugin source not found at $PluginSource"
}

# 查找所有的 dita-ot-* 目录
$DitaInstalls = Get-ChildItem -Path $ToolsDir -Directory -Filter "dita-ot-*"

if ($DitaInstalls.Count -eq 0) {
    Write-Warning "No DITA-OT installations found in $ToolsDir"
    exit
}

# 设置 JAVA_HOME/JAVACMD
if (Test-Path $Java17Path) {
    $env:JAVACMD = $Java17Path
    Write-Host "Using Java runtime: $Java17Path" -ForegroundColor Cyan
}

foreach ($DitaDir in $DitaInstalls) {
    $DitaBin = Join-Path $DitaDir.FullName "bin\dita.bat"
    $TargetPluginDir = Join-Path $DitaDir.FullName "plugins\com.chefos.pdf"
    
    if (Test-Path $DitaBin) {
        Write-Host "`n--------------------------------------------------" -ForegroundColor Green
        Write-Host "Installing plugin into: $($DitaDir.Name)" -ForegroundColor Green
        Write-Host "--------------------------------------------------"
        
        # 1. 手动复制插件文件 (比 dita --install <path> 更可靠)
        Write-Host "Copying plugin files..." -ForegroundColor Gray
        if (Test-Path $TargetPluginDir) {
            Remove-Item -Recurse -Force $TargetPluginDir
        }
        Copy-Item -Recurse -Force $PluginSource $TargetPluginDir

        # 2. 运行集成命令
        Write-Host "Running integration..." -ForegroundColor Gray
        
        $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
        $ProcessInfo.FileName = $DitaBin
        $ProcessInfo.Arguments = "--install --verbose" # 不带参数即为集成
        $ProcessInfo.RedirectStandardOutput = $true
        $ProcessInfo.RedirectStandardError = $true
        $ProcessInfo.UseShellExecute = $false
        $ProcessInfo.CreateNoWindow = $true
        
        $Process = [System.Diagnostics.Process]::Start($ProcessInfo)
        $stdout = $Process.StandardOutput.ReadToEnd()
        $stderr = $Process.StandardError.ReadToEnd()
        $Process.WaitForExit()

        if ($Process.ExitCode -eq 0) {
            Write-Host "SUCCESS: Plugin installed in $($DitaDir.Name)" -ForegroundColor Cyan
        } else {
            Write-Host "FAILED to integrate in $($DitaDir.Name). Exit code: $($Process.ExitCode)" -ForegroundColor Red
            Write-Host "STDERR: $stderr" -ForegroundColor Red
            Write-Host "STDOUT: $stdout" -ForegroundColor Gray
        }
    } else {
        Write-Warning "Skipping $($DitaDir.Name): bin\dita.bat not found."
    }
}

Write-Host "`nAll operations completed." -ForegroundColor Green
