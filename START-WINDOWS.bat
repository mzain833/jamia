@echo off
setlocal
set "ROOT=%~dp0"
start "Jamia Backend API" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%backend'; npm run dev"
start "Jamia Frontend Vite" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%frontend'; npm run dev"
echo Started backend and frontend terminals. Wait for both servers, then open http://localhost:5173
endlocal
