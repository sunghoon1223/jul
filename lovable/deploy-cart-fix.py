#!/usr/bin/env python3
import ftplib
import os
import sys

def deploy_to_ftp():
    """Deploy cart fix to FTP server"""
    
    # FTP Configuration (using hostinger settings)
    FTP_HOST = "ftp.studio-sb.com"
    FTP_USER = "u597195020.ssh"
    FTP_PASS = "Jj2478655!"
    
    print(f"🚀 Starting deployment to {FTP_HOST}")
    print(f"📂 User: {FTP_USER}")
    
    try:
        # Connect to FTP
        print("🔌 Connecting to FTP server...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ FTP connection successful!")
        
        # Already in public_html directory
        print("📁 Already in public_html directory")
        current_dir = ftp.pwd()
        print(f"📁 Current directory: {current_dir}")
        
        # Upload dist files
        dist_path = './dist'
        if not os.path.exists(dist_path):
            print("❌ Dist folder not found!")
            return False
            
        print("📤 Starting file upload...")
        
        # Upload all files in dist
        for root, dirs, files in os.walk(dist_path):
            # Create directories on server
            for dir_name in dirs:
                local_dir = os.path.join(root, dir_name)
                # Convert local path to remote path
                remote_dir = local_dir.replace(dist_path, '').replace('\\', '/').lstrip('/')
                if remote_dir:
                    try:
                        ftp.mkd(remote_dir)
                        print(f"📁 Created directory: {remote_dir}")
                    except ftplib.error_perm:
                        # Directory might already exist
                        pass
            
            # Upload files
            for file_name in files:
                local_file = os.path.join(root, file_name)
                # Convert local path to remote path
                remote_file = local_file.replace(dist_path, '').replace('\\', '/').lstrip('/')
                
                try:
                    with open(local_file, 'rb') as f:
                        ftp.storbinary(f'STOR {remote_file}', f)
                    print(f"✅ Uploaded: {remote_file}")
                except Exception as e:
                    print(f"❌ Failed to upload {remote_file}: {e}")
        
        print("🎉 Deployment completed successfully!")
        ftp.quit()
        return True
        
    except ftplib.error_perm as e:
        print(f"❌ FTP Permission Error: {e}")
        print("💡 Please check your FTP credentials")
        return False
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        return False

if __name__ == "__main__":
    deploy_to_ftp()