@echo off
REM GMAO Code Backup Script
REM This script backs up the source code (excluding build artifacts and dependencies)

echo Starting code backup...

REM Configuration
set BACKUP_DIR=C:\Users\Balsem\Desktop\GMAO\backups\code
set SOURCE_DIR=C:\Users\Balsem\Desktop\GMAO
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_NAME=gmao_code_%DATE%

REM Remove spaces from time format
set BACKUP_NAME=%BACKUP_NAME: =0%

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Creating backup: %BACKUP_NAME%

REM Create a temporary directory for selective backup
set TEMP_BACKUP_DIR=%BACKUP_DIR%\temp_%BACKUP_NAME%
mkdir "%TEMP_BACKUP_DIR%"

REM Copy important directories and files using robocopy (more reliable)
robocopy "%SOURCE_DIR%" "%TEMP_BACKUP_DIR%" /E /XF *.log /XD node_modules .next dist .git backups logs

REM Compress the backup
powershell "Compress-Archive -Path '%TEMP_BACKUP_DIR%' -DestinationPath '%BACKUP_DIR%\%BACKUP_NAME%.zip' -Force"

REM Remove temporary directory
rmdir /s /q "%TEMP_BACKUP_DIR%"

REM Check if backup was successful
if %errorlevel% equ 0 (
    echo Backup completed successfully: %BACKUP_DIR%\%BACKUP_NAME%.zip

    REM Clean up old backups (keep last 4 weeks)
    echo Cleaning up old backups...
    forfiles /p "%BACKUP_DIR%" /m "*.zip" /d -28 /c "cmd /c del @path" 2>nul || echo No old backups to clean up.

    echo Code backup process completed!
    exit /b 0

) else (
    echo ERROR: Code backup failed!
    exit /b 1
)