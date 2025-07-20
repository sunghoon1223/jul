#!/usr/bin/env python3
import os
import ftplib
from pathlib import Path
import sys

# FTP credentials
FTP_HOST = "ftp.studio-sb.com"
FTP_USER = "u597195020.ssh"
FTP_PASS = "Jj2478655!"
REMOTE_DIR = "public_html"
LOCAL_DIR = "dist"

def upload_file(ftp, local_path, remote_path):
    """Upload a single file to FTP server"""
    try:
        with open(local_path, 'rb') as file:
            ftp.storbinary(f'STOR {remote_path}', file)
        print(f"✅ Uploaded: {remote_path}")
    except Exception as e:
        print(f"❌ Failed to upload {remote_path}: {e}")
        return False
    return True

def create_remote_dir(ftp, remote_dir):
    """Create directory on FTP server if it doesn't exist"""
    try:
        ftp.mkd(remote_dir)
    except ftplib.error_perm:
        # Directory might already exist
        pass

def upload_directory(ftp, local_dir, remote_dir):
    """Recursively upload a directory to FTP server"""
    local_path = Path(local_dir)
    
    for item in local_path.iterdir():
        if item.is_file():
            remote_path = f"{remote_dir}/{item.name}"
            upload_file(ftp, str(item), remote_path)
        elif item.is_dir():
            remote_subdir = f"{remote_dir}/{item.name}"
            create_remote_dir(ftp, remote_subdir)
            upload_directory(ftp, str(item), remote_subdir)

def main():
    print("🚀 Starting FTP deployment to studio-sb.com...")
    
    # Check if dist directory exists
    if not os.path.exists(LOCAL_DIR):
        print("❌ Error: dist directory not found. Run 'npm run build' first.")
        sys.exit(1)
    
    try:
        # Connect to FTP server
        print(f"📡 Connecting to {FTP_HOST}...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        
        # Try to change to remote directory
        try:
            ftp.cwd(REMOTE_DIR)
            print(f"📂 Changed to {REMOTE_DIR}")
        except:
            # If public_html doesn't exist, we might already be in the right directory
            print(f"📂 Using current directory")
        
        # Clean up old files
        print("🧹 Cleaning up old files...")
        try:
            # List and delete HTML files
            for filename in ftp.nlst():
                if filename.endswith(('.html', '.js', '.css')) and not filename.startswith('.'):
                    try:
                        ftp.delete(filename)
                    except:
                        pass
            
            # Try to remove assets directory
            try:
                ftp.rmd('assets')
            except:
                pass
        except Exception as e:
            print(f"⚠️  Warning during cleanup: {e}")
        
        # Upload all files from dist
        print("📤 Uploading files...")
        upload_directory(ftp, LOCAL_DIR, ".")
        
        # Set permissions for .htaccess
        try:
            ftp.sendcmd('SITE CHMOD 644 .htaccess')
            print("✅ Set permissions for .htaccess")
        except:
            print("⚠️  Could not set .htaccess permissions (might not be supported)")
        
        # Close connection
        ftp.quit()
        
        print("\n✅ Deployment successful!")
        print("🌐 Your site is live at: https://studio-sb.com")
        print("\n🧪 Test these routes:")
        print("   - https://studio-sb.com/route-debug.html")
        print("   - https://studio-sb.com/categories/agv-casters")
        print("   - https://studio-sb.com/products/mecanum-multi-directional-125mm")
        
    except Exception as e:
        print(f"\n❌ Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()