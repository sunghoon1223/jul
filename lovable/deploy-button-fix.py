#!/usr/bin/env python3
import ftplib
import os

# FTP Configuration
FTP_HOST = "ftp.studio-sb.com"
FTP_USER = "u597195020.ssh"
FTP_PASS = "Jj2478655!"
FTP_ROOT = "/domains/studio-sb.com/public_html"

print("🚀 Deploying button fix...")

try:
    # Connect to FTP
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.cwd(FTP_ROOT)
    
    # Upload main JS file with button fix
    js_file = "dist/assets/index-B0iuYR4r.js"
    if os.path.exists(js_file):
        with open(js_file, 'rb') as f:
            ftp.storbinary('STOR assets/index-B0iuYR4r.js', f)
        print(f"✅ Uploaded {js_file}")
    
    # Upload index.html
    if os.path.exists("dist/index.html"):
        with open("dist/index.html", 'rb') as f:
            ftp.storbinary('STOR index.html', f)
        print("✅ Uploaded index.html")
    
    ftp.quit()
    print("🎉 Button fix deployed successfully!")
    
except Exception as e:
    print(f"❌ Deployment failed: {e}")