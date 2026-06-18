@echo off
REM GMAO Complete Backup Script
REM This script runs all backup operations

echo ========================================
echo    GMAO Complete Backup System
echo ========================================
echo Starting backup process at %date% %time%
echo.

REM Run MongoDB backup
echo [1/3] Running MongoDB backup...
call "%~dp0backup-mongo.bat"
set MONGO_RESULT=%errorlevel%
if %MONGO_RESULT% neq 0 (
    echo ERROR: MongoDB backup failed with code %MONGO_RESULT%!
    goto :error
)
echo MongoDB backup completed.
echo.

REM Run filesystem backup
echo [2/3] Running filesystem backup...
call "%~dp0backup-files.bat"
set FILES_RESULT=%errorlevel%
if %FILES_RESULT% neq 0 (
    echo ERROR: Filesystem backup failed with code %FILES_RESULT%!
    goto :error
)
echo Filesystem backup completed.
echo.

REM Run code backup
echo [3/3] Running code backup...
call "%~dp0backup-code.bat"
set CODE_RESULT=%errorlevel%
if %CODE_RESULT% neq 0 (
    echo ERROR: Code backup failed with code %CODE_RESULT%!
    goto :error
)
echo Code backup completed.
echo.

REM Run verification
echo [4/4] Running backup verification...
call "%~dp0verify-backups.bat"
if %errorlevel% neq 0 (
    echo WARNING: Backup verification found issues!
) else (
    echo Backup verification completed successfully.
)

echo.
echo ========================================
echo    All backups completed successfully!
echo ========================================
echo Backup process finished at %date% %time%
goto :end

:error
echo.
echo ========================================
echo    BACKUP PROCESS FAILED!
echo ========================================
echo Some backups failed. Please check the logs above.
exit /b 1

:end