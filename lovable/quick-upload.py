#!/usr/bin/env python3
import subprocess
import os

# Try uploading using curl with different password formats
passwords = ["JP93541**", "JP93541\\*\\*", "'JP93541**'", "\"JP93541**\""]
files_to_upload = [
    ("dist/index.html", "index.html"),
    ("dist/assets/index-BnXsGBGE.js", "assets/index-BnXsGBGE.js")
]

host = "ftp.studio-sb.com"
user = "studio-sb.com"

print("🚀 Trying to upload critical files with different password formats...")

for i, password in enumerate(passwords):
    print(f"\n🔑 Attempt {i+1}: Testing password format...")
    
    # Try uploading index.html first
    cmd = f'curl -u "{user}:{password}" -T "dist/index.html" "ftp://{host}/public_html/index.html"'
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print(f"✅ Success with password format {i+1}!")
            
            # Upload all files with this working password format
            for local_file, remote_file in files_to_upload:
                if os.path.exists(local_file):
                    cmd = f'curl -u "{user}:{password}" -T "{local_file}" "ftp://{host}/public_html/{remote_file}"'
                    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
                    if result.returncode == 0:
                        print(f"📤 Uploaded {remote_file}")
                    else:
                        print(f"❌ Failed to upload {remote_file}")
            break
        else:
            print(f"❌ Failed: {result.stderr.strip()}")
    
    except subprocess.TimeoutExpired:
        print("⏰ Timeout")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n🏁 Upload attempt completed")