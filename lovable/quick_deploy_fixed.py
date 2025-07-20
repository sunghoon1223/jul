#!/usr/bin/env python3
import ftplib
import os

host = 'ftp.studio-sb.com'
username = 'u597195020.ssh'
password = 'Jj2478655!'
dist_path = '/mnt/c/MYCLAUDE_PROJECT/jul/lovable/dist'

print('🚀 수정된 파일 배포 시작...')

# FTP 연결
ftp = ftplib.FTP(host)
ftp.login(username, password)
print(f'✅ FTP 연결 성공! 현재 위치: {ftp.pwd()}')

upload_count = 0

# 중요 파일들 업로드
important_files = ['index.html', 'robots.txt', 'placeholder.svg']

for file in important_files:
    local_file = os.path.join(dist_path, file)
    if os.path.exists(local_file):
        with open(local_file, 'rb') as f:
            ftp.storbinary(f'STOR {file}', f)
        print(f'✅ {file} 업로드 완료')
        upload_count += 1

# assets 폴더 업로드 (새로운 파일들)
assets_dir = os.path.join(dist_path, 'assets')
if os.path.exists(assets_dir):
    # 새로 생성된 JS 파일들만 업로드
    new_js_files = [
        'index-CJICXetd.js',  # 메인 번들 (환경변수 포함)
        'AdminPage-Cn3yWT0x.js',  # 관리자 페이지 (챗봇 개선)
    ]
    
    for file in new_js_files:
        local_file = os.path.join(assets_dir, file)
        if os.path.exists(local_file):
            with open(local_file, 'rb') as f:
                ftp.storbinary(f'STOR assets/{file}', f)
            print(f'✅ assets/{file} 업로드 완료')
            upload_count += 1

# data 폴더는 그대로 유지

ftp.quit()
print(f'🎉 수정사항 배포 완료! 총 {upload_count}개 파일 업로드됨')
print()
print('🔧 수정된 내용:')
print('- Gemini API 키 빌드 시 포함 보장')
print('- 장바구니 localStorage 에러 핸들링 개선')
print('- 전역 에러 모니터링 추가')
print('- 챗봇 API 키 검증 로직 추가')