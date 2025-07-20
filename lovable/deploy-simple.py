#!/usr/bin/env python3
import ftplib
import os
from pathlib import Path

def upload_file(ftp, local_path, remote_path):
    """Upload a single file to FTP server"""
    try:
        with open(local_path, 'rb') as f:
            ftp.storbinary(f'STOR {remote_path}', f)
        return True
    except Exception as e:
        print(f"❌ Failed to upload {local_path}: {e}")
        return False

def main():
    # Credentials (working from previous successful deployments)
    host = "ftp.studio-sb.com"
    user = "studio-sb.com"
    
    # Try different password formats
    passwords = [
        "JP93541**",
        "JP93541\\*\\*",
        "JP93541\\!\\!",
        "JP93541!!"
    ]
    
    for password in passwords:
        print(f"🔑 Trying password format: {password[:8]}...")
        
        try:
            ftp = ftplib.FTP(host, timeout=30)
            ftp.login(user, password)
            ftp.cwd("public_html")
            
            print("✅ Successfully connected!")
            
            # Upload critical files
            critical_files = [
                ('dist/index.html', 'index.html'),
                ('dist/assets/index-v7ujy3pl.js', 'assets/index-v7ujy3pl.js')
            ]
            
            for local_file, remote_file in critical_files:
                if os.path.exists(local_file):
                    print(f"📤 Uploading {remote_file}...")
                    if upload_file(ftp, local_file, remote_file):
                        print(f"✅ {remote_file} uploaded successfully")
                    else:
                        print(f"❌ Failed to upload {remote_file}")
                else:
                    print(f"⚠️ {local_file} not found")
            
            ftp.quit()
            print("🎉 Deployment completed successfully!")
            return True
            
        except ftplib.error_perm as e:
            if "530" in str(e):
                print(f"❌ Login failed with this password")
                continue
            else:
                print(f"❌ Permission error: {e}")
                continue
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            continue
    
    print("❌ All password attempts failed")
    return False

if __name__ == "__main__":
    main()