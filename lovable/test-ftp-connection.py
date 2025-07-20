#!/usr/bin/env python3
import ftplib

# FTP Configuration
FTP_HOST = "ftp.studio-sb.com"
FTP_USER = "u597195020.ssh"
FTP_PASS = "Jj2478655!"

print(f"🔌 Connecting to {FTP_HOST}...")

try:
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    print("✅ FTP connection successful!")
    
    # Show current directory
    current_dir = ftp.pwd()
    print(f"📁 Current directory: {current_dir}")
    
    # List directories
    print("📂 Directory listing:")
    directories = []
    ftp.retrlines('LIST', directories.append)
    for item in directories:
        print(f"  {item}")
    
    ftp.quit()
    
except Exception as e:
    print(f"❌ Error: {e}")