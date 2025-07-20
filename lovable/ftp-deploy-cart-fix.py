#!/usr/bin/env python3
import ftplib
import os
from pathlib import Path

def deploy_to_hostinger():
    # FTP credentials
    host = "ftp.studio-sb.com"
    username = "studio-sb.com"
    password = "JP93541**"
    
    print("🚀 Starting cart fix deployment to Hostinger...")
    
    try:
        # Connect to FTP
        ftp = ftplib.FTP(host)
        ftp.login(username, password)
        ftp.cwd("public_html")
        
        print("✅ Connected to FTP server")
        
        # Upload files from dist directory
        dist_dir = Path("dist")
        uploaded_files = 0
        
        for root, dirs, files in os.walk(dist_dir):
            # Get relative path
            rel_path = Path(root).relative_to(dist_dir)
            
            # Create directories on server if needed
            if rel_path != Path("."):
                remote_path = str(rel_path).replace("\\", "/")
                try:
                    ftp.mkd(remote_path)
                    print(f"📁 Created directory: {remote_path}")
                except ftplib.error_perm as e:
                    if "exists" not in str(e).lower():
                        print(f"⚠️ Could not create directory {remote_path}: {e}")
            
            # Upload files
            for file in files:
                local_file = Path(root) / file
                if rel_path == Path("."):
                    remote_file = file
                else:
                    remote_file = str(rel_path / file).replace("\\", "/")
                
                print(f"📤 Uploading {remote_file}...")
                
                with open(local_file, 'rb') as f:
                    ftp.storbinary(f'STOR {remote_file}', f)
                uploaded_files += 1
        
        ftp.quit()
        print(f"🎉 Cart fix deployment completed! Uploaded {uploaded_files} files.")
        
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    deploy_to_hostinger()