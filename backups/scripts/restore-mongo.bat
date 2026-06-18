@echo off
REM GMAO MongoDB Restore Script
REM This script restores a MongoDB backup

echo ========================================
echo    GMAO MongoDB Restore Tool
echo ========================================

if "%1"=="" (
    echo Usage: %0 ^<backup_file.zip^>
    echo.
    echo Example: %0 "C:\Users\Balsem\Desktop\GMAO\backups\mongodb\gmao_mongo_20241201_143000.zip"
    echo.
    echo Available backups:
    dir /b "C:\Users\Balsem\Desktop\GMAO\backups\mongodb\*.zip" 2>nul
    if errorlevel 1 echo No backups found.
    exit /b 1
)

set BACKUP_FILE=%1
set RESTORE_DIR=C:\Users\Balsem\Desktop\GMAO\backups\temp_restore
set DB_NAME=GMAO_IPROTEX
set DB_HOST=localhost
set DB_PORT=27017

echo WARNING: This will REPLACE the current database!
echo Database: %DB_NAME%
echo Backup file: %BACKUP_FILE%
echo.

set /p CONFIRM="Are you sure you want to continue? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo Restore cancelled.
    exit /b 0
)

echo.
echo Starting restore process...

REM Create temporary directory
if exist "%RESTORE_DIR%" rmdir /s /q "%RESTORE_DIR%"
mkdir "%RESTORE_DIR%"

REM Extract backup
echo Extracting backup...
powershell "Expand-Archive -Path '%BACKUP_FILE%' -DestinationPath '%RESTORE_DIR%' -Force"

REM Find the database directory
for /d %%i in ("%RESTORE_DIR%\*") do set DB_DIR=%%i

echo Restoring database from: %DB_DIR%

REM Restore MongoDB
"C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --host %DB_HOST% --port %DB_PORT% --db %DB_NAME% --drop "%DB_DIR%\%DB_NAME%"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ RESTORE COMPLETED SUCCESSFULLY
    echo ========================================
    echo Database %DB_NAME% has been restored from backup.
) else (
    echo.
    echo ========================================
    echo ✗ RESTORE FAILED
    echo ========================================
    echo Please check the error messages above.
    exit /b 1
)

REM Clean up
echo Cleaning up temporary files...
rmdir /s /q "%RESTORE_DIR%"

echo Restore process completed.