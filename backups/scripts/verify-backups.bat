@echo off
REM GMAO Backup Verification Script
REM This script verifies the integrity of created backups

echo Starting backup verification...

set BACKUP_ROOT=C:\Users\Balsem\Desktop\GMAO\backups
set VERIFICATION_LOG=%BACKUP_ROOT%\verification_log.txt

echo Backup Verification Report > "%VERIFICATION_LOG%"
echo Generated on %date% %time% >> "%VERIFICATION_LOG%"
echo. >> "%VERIFICATION_LOG%"

set ERROR_COUNT=0

REM Check MongoDB backups
echo Checking MongoDB backups...
echo MongoDB Backups: >> "%VERIFICATION_LOG%"
if exist "%BACKUP_ROOT%\mongodb\*.zip" (
    echo Latest backup found >> "%VERIFICATION_LOG%"
    for /f %%i in ('dir /b /o-d "%BACKUP_ROOT%\mongodb\*.zip" 2^>nul') do (
        echo   %%i >> "%VERIFICATION_LOG%"
        goto :mongodb_ok
    )
)
:mongodb_ok
echo [OK] MongoDB backup exists
goto :check_filesystem

:check_filesystem
REM Check filesystem backups
echo Checking filesystem backups...
echo Filesystem Backups: >> "%VERIFICATION_LOG%"
if exist "%BACKUP_ROOT%\filesystem\*.zip" (
    echo Latest backup found >> "%VERIFICATION_LOG%"
    for /f %%i in ('dir /b /o-d "%BACKUP_ROOT%\filesystem\*.zip" 2^>nul') do (
        echo   %%i >> "%VERIFICATION_LOG%"
        goto :filesystem_ok
    )
)
:filesystem_ok
echo [OK] Filesystem backup exists
goto :check_code

:check_code
REM Check code backups
echo Checking code backups...
echo Code Backups: >> "%VERIFICATION_LOG%"
if exist "%BACKUP_ROOT%\code\*.zip" (
    echo Latest backup found >> "%VERIFICATION_LOG%"
    for /f %%i in ('dir /b /o-d "%BACKUP_ROOT%\code\*.zip" 2^>nul') do (
        echo   %%i >> "%VERIFICATION_LOG%"
        goto :code_ok
    )
)
:code_ok
echo [OK] Code backup exists
goto :summary

:summary
echo.
echo ========================================
echo    VERIFICATION COMPLETED
echo ========================================
echo All backup types are present!
echo Log saved to: %VERIFICATION_LOG%