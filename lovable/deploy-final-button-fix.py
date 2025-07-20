#!/usr/bin/env python3
import ftplib
import os

# FTP Configuration
FTP_HOST = "ftp.studio-sb.com"
FTP_USER = "u597195020.ssh"
FTP_PASS = "Jj2478655!"

print("🚀 최종 버튼 가시성 문제 수정 배포 중...")

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
    
    # Ensure assets directory exists
    try:
        ftp.mkd('assets')
    except:
        pass
    
    # Upload updated CSS file
    css_file = "dist/assets/index-LMgN35lP.css"
    if os.path.exists(css_file):
        with open(css_file, 'rb') as f:
            ftp.storbinary('STOR assets/index-LMgN35lP.css', f)
        print(f"✅ Uploaded {css_file}")
    
    # Upload updated FAQPage JS file
    faq_file = "dist/assets/FAQPage-r1a6HbV4.js"
    if os.path.exists(faq_file):
        with open(faq_file, 'rb') as f:
            ftp.storbinary('STOR assets/FAQPage-r1a6HbV4.js', f)
        print(f"✅ Uploaded {faq_file}")
    
    # Upload updated DealersPage JS file
    dealers_file = "dist/assets/DealersPage-DDnZBofZ.js"
    if os.path.exists(dealers_file):
        with open(dealers_file, 'rb') as f:
            ftp.storbinary('STOR assets/DealersPage-DDnZBofZ.js', f)
        print(f"✅ Uploaded {dealers_file}")
    
    # Upload main JS file
    js_file = "dist/assets/index-gQPNz4uM.js"
    if os.path.exists(js_file):
        with open(js_file, 'rb') as f:
            ftp.storbinary('STOR assets/index-gQPNz4uM.js', f)
        print(f"✅ Uploaded {js_file}")
    
    # Upload index.html
    if os.path.exists("dist/index.html"):
        with open("dist/index.html", 'rb') as f:
            ftp.storbinary('STOR index.html', f)
        print("✅ Uploaded index.html")
    
    ftp.quit()
    print("🎉 최종 버튼 가시성 문제 수정 배포 완료!")
    
except Exception as e:
    print(f"❌ Deployment failed: {e}")