#!/usr/bin/env python3
import ftplib
import os

# FTP Configuration
FTP_HOST = "ftp.studio-sb.com"
FTP_USER = "u597195020.ssh"
FTP_PASS = "Jj2478655!"

print("🚀 Quick deploying button fix...")

try:
    # Connect to FTP
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    
    # Try to change to public_html or stay in current directory
    try:
        ftp.cwd("public_html")
        print("📂 Changed to public_html")
    except:
        print("📂 Using current directory")
    
    # Upload the JS file with fix
    js_file = "dist/assets/index-DQ_eu0yy.js"
    if os.path.exists(js_file):
        # Ensure assets directory exists
        try:
            ftp.mkd('assets')
        except:
            pass
        
        with open(js_file, 'rb') as f:
            ftp.storbinary('STOR assets/index-B0iuYR4r.js', f)
        print(f"✅ Uploaded {js_file}")
    
    # Upload index.html
    if os.path.exists("dist/index.html"):
        with open("dist/index.html", 'rb') as f:
            ftp.storbinary('STOR index.html', f)
        print("✅ Uploaded index.html")
    
    ftp.quit()
    print("🎉 Quick fix deployed!")
    
except Exception as e:
    print(f"❌ Deployment failed: {e}")