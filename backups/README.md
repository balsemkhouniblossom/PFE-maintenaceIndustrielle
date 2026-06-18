# GMAO Backup System

A comprehensive backup solution for the GMAO (Gestion de Maintenance Assistée par Ordinateur) system.

## 📋 Overview

This backup system creates automated backups of:
- **MongoDB Database**: All application data (users, machines, work orders, etc.)
- **Filesystem**: Uploaded files, logs, and configuration files
- **Source Code**: Application source code and configurations

## 🚀 Quick Start

### Run All Backups
```batch
# From the backups/scripts directory
backup-all.bat
```

### Run Individual Backups
```batch
# MongoDB backup only
backup-mongo.bat

# Filesystem backup only
backup-files.bat

# Code backup only
backup-code.bat
```

### Verify Backups
```batch
verify-backups.bat
```

## 📁 Backup Structure

```
backups/
├── mongodb/          # Database backups (.zip)
├── filesystem/       # File and config backups (.zip)
├── code/            # Source code backups (.zip)
└── scripts/         # Backup scripts
    ├── backup-all.bat      # Run all backups
    ├── backup-mongo.bat    # MongoDB backup
    ├── backup-files.bat    # Filesystem backup
    ├── backup-code.bat     # Code backup
    ├── verify-backups.bat  # Verification script
    └── restore-mongo.bat   # Database restore
```

## ⏰ Automated Scheduling

### Windows Task Scheduler

1. Open Task Scheduler
2. Create a new task:
   - **Name**: GMAO Daily Backup
   - **Trigger**: Daily at 2:00 AM
   - **Action**: Start a program
     - Program: `C:\Windows\System32\cmd.exe`
     - Arguments: `/c "C:\Users\Balsem\Desktop\GMAO\backups\scripts\backup-all.bat"`

### PowerShell Scheduled Job

```powershell
# Create a daily backup job
$trigger = New-JobTrigger -Daily -At "02:00"
Register-ScheduledJob -Name "GMAO_Backup" -Trigger $trigger -ScriptBlock {
    & "C:\Users\Balsem\Desktop\GMAO\backups\scripts\backup-all.bat"
}
```

## 🔄 Restore Procedures

### Restore MongoDB Database

```batch
# List available backups
dir "C:\Users\Balsem\Desktop\GMAO\backups\mongodb"

# Restore specific backup
restore-mongo.bat "C:\Users\Balsem\Desktop\GMAO\backups\mongodb\gmao_mongo_20241201_143000.zip"
```

⚠️ **WARNING**: Database restore will replace all current data!

### Restore Files

```batch
# Extract filesystem backup manually
powershell "Expand-Archive -Path 'C:\Users\Balsem\Desktop\GMAO\backups\filesystem\filesystem_20241201_143000.zip' -DestinationPath 'C:\Restore\filesystem'"

# Copy files back to their locations
```

### Restore Code

```batch
# Extract code backup
powershell "Expand-Archive -Path 'C:\Users\Balsem\Desktop\GMAO\backups\code\gmao_code_20241201_143000.zip' -DestinationPath 'C:\Restore\code'"
```

## 📊 Retention Policy

- **MongoDB**: Keep 7 days of daily backups
- **Filesystem**: Keep 30 days of backups
- **Code**: Keep 4 weeks of backups

## 🔍 Monitoring & Verification

The system includes automatic verification:
- Checks for backup file existence
- Validates backup file sizes
- Generates verification logs

Run verification manually:
```batch
verify-backups.bat
```

Check the log file: `backups\verification_log.txt`

## 🛠️ Customization

### Change Backup Locations

Edit the scripts and modify these variables:
```batch
set BACKUP_DIR=C:\Your\Custom\Path\backups
set SOURCE_DIR=C:\Your\Project\Path
```

### Modify Retention Periods

In each backup script, change the cleanup days:
```batch
# Keep 7 days instead of default
forfiles /p "%BACKUP_DIR%" /m "*.zip" /d -7 /c "cmd /c del @path"
```

## 📧 Notifications (Optional)

Add email notifications by installing a tool like `sendmail` or using PowerShell:

```batch
# Add to backup scripts
powershell "Send-MailMessage -To 'admin@company.com' -From 'backup@gmao.com' -Subject 'GMAO Backup Completed' -Body 'Backup completed successfully' -SmtpServer 'smtp.company.com'"
```

## 🔐 Security Considerations

1. **Encrypt sensitive backups** (consider adding encryption)
2. **Store backups offsite** (cloud storage, external drives)
3. **Test restores regularly** (quarterly restore tests)
4. **Monitor backup logs** (check for failures)

## 🆘 Troubleshooting

### MongoDB Backup Fails
- Ensure MongoDB is running
- Check connection string in `backup-mongo.bat`
- Verify mongodump is in PATH

### Filesystem Backup Empty
- Check source directories exist
- Verify write permissions
- Review exclusion patterns

### Verification Fails
- Check backup directories exist
- Ensure backups completed successfully
- Review verification log for details

## 📞 Support

For issues with the backup system:
1. Check the verification log: `backups\verification_log.txt`
2. Run individual backup scripts to isolate issues
3. Ensure all required tools are installed (MongoDB, PowerShell)

---

**Last Updated**: December 2024
**Version**: 1.0