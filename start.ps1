$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskNode = Get-Command node -ErrorAction SilentlyContinue
if ($taskNode) {
    & $taskNode.Source server.mjs
} else {
    $taskBundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $taskBundledNode) {
        & $taskBundledNode server.mjs
    } else {
        throw 'Install Node.js 24 or later, then run this script again.'
    }
}
