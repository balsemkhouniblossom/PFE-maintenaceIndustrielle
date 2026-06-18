@echo off
REM GMAO MongoDB Backup Script
REM This script creates a backup of the GMAO_IPROTEX database

echo Starting MongoDB backup...

REM Configuration
set BACKUP_DIR=C:\Users\Balsem\Desktop\GMAO\backups\mongodb
set DB_NAME=GMAO_IPROTEX
set DB_HOST=localhost
set DB_PORT=27017
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_NAME=gmao_mongo_%DATE%

REM Remove spaces from time format
set BACKUP_NAME=%BACKUP_NAME: =0%

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Creating backup: %BACKUP_NAME%

REM Create MongoDB backup
"C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe" --host %DB_HOST% --port %DB_PORT% --db %DB_NAME% --out "%BACKUP_DIR%\%BACKUP_NAME%"

REM Check if backup was successful
if %errorlevel% equ 0 (
    echo Compressing backup...

    REM Compress the backup
    powershell "Compress-Archive -Path '%BACKUP_DIR%\%BACKUP_NAME%' -DestinationPath '%BACKUP_DIR%\%BACKUP_NAME%.zip' -Force"

    REM Remove uncompressed backup
    rmdir /s /q "%BACKUP_DIR%\%BACKUP_NAME%"

    echo Backup completed successfully: %BACKUP_DIR%\%BACKUP_NAME%.zip

    REM Clean up old backups (keep last 7 days)
    echo Cleaning up old backups...
    forfiles /p "%BACKUP_DIR%" /m "*.zip" /d -7 /c "cmd /c del @path" 2>nul || echo No old backups to clean up.

    echo Backup process completed!
    exit /b 0

) else (
    echo ERROR: MongoDB backup failed!
    exit /b 1
)