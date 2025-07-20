#!/usr/bin/env node

// 🔄 백업 복원 스크립트 (자동 생성)
// 생성 시간: 2025-07-16T11:09:19.788Z

import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd();

async function restore() {
  console.log('🔄 백업 복원 시작...');
  
  try {
    // products.json 복원
    const productsBackup = path.join(PROJECT_ROOT, 'src', 'data', 'products.json.backup-2025-07-16T11-09-19-195Z');
    const productsOriginal = path.join(PROJECT_ROOT, 'src', 'data', 'products.json');
    
    await fs.copyFile(productsBackup, productsOriginal);
    console.log('✅ products.json 복원 완료');
    
    // images 폴더 복원
    const imagesBackup = path.join(PROJECT_ROOT, 'public', 'images-backup-2025-07-16T11-09-19-195Z');
    const imagesOriginal = path.join(PROJECT_ROOT, 'public', 'images');
    
    // 기존 images 폴더 제거
    await fs.rm(imagesOriginal, { recursive: true, force: true });
    
    // 백업에서 복원
    await copyDirectory(imagesBackup, imagesOriginal);
    console.log('✅ images 폴더 복원 완료');
    
    console.log('🎉 백업 복원 성공!');
    
  } catch (error) {
    console.error('❌ 복원 실패:', error.message);
    process.exit(1);
  }
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

restore();
