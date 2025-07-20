#!/usr/bin/env node

// 🔒 JP Caster 프로젝트 백업 시스템
// 안전한 이미지 통합 작업을 위한 백업 생성 스크립트

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 루트 경로
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function createBackup() {
  console.log('🔒 이미지 통합 백업 시스템 시작...');
  
  try {
    // 타임스탬프 생성 (YYYY-MM-DDTHH-MM-SS-SSSZ)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log(`📅 백업 타임스탬프: ${timestamp}`);
    
    // 백업 디렉토리 생성
    const backupDir = path.join(PROJECT_ROOT, 'backups', `backup-${timestamp}`);
    await fs.mkdir(backupDir, { recursive: true });
    console.log(`📁 백업 디렉토리 생성: ${backupDir}`);
    
    // 1. products.json 백업
    await backupProductsJson(timestamp);
    
    // 2. public/images 폴더 백업
    await backupImagesFolder(timestamp);
    
    // 3. 백업 정보 생성
    await createBackupInfo(timestamp, backupDir);
    
    // 4. 복원 스크립트 생성
    await createRestoreScript(timestamp);
    
    console.log('✅ 백업 시스템 완료!');
    console.log(`📦 백업 위치: ${backupDir}`);
    console.log('🔄 복원 방법: npm run restore-backup [timestamp]');
    
    return { success: true, timestamp, backupDir };
    
  } catch (error) {
    console.error('❌ 백업 실패:', error.message);
    throw error;
  }
}

async function backupProductsJson(timestamp) {
  const sourcePath = path.join(PROJECT_ROOT, 'src', 'data', 'products.json');
  const backupPath = path.join(PROJECT_ROOT, 'src', 'data', `products.json.backup-${timestamp}`);
  
  try {
    // 원본 파일 존재 확인
    await fs.access(sourcePath);
    
    // 백업 생성
    await fs.copyFile(sourcePath, backupPath);
    
    // 파일 크기 확인
    const stats = await fs.stat(sourcePath);
    const backupStats = await fs.stat(backupPath);
    
    if (stats.size === backupStats.size) {
      console.log(`✅ products.json 백업 완료 (${stats.size} bytes)`);
    } else {
      throw new Error('백업 파일 크기 불일치');
    }
    
  } catch (error) {
    console.error('❌ products.json 백업 실패:', error.message);
    throw error;
  }
}

async function backupImagesFolder(timestamp) {
  const sourcePath = path.join(PROJECT_ROOT, 'public', 'images');
  const backupPath = path.join(PROJECT_ROOT, 'public', `images-backup-${timestamp}`);
  
  try {
    // 원본 폴더 존재 확인
    await fs.access(sourcePath);
    
    // 폴더 복사 (재귀적)
    await copyDirectory(sourcePath, backupPath);
    
    // 파일 개수 확인
    const sourceFiles = await countFiles(sourcePath);
    const backupFiles = await countFiles(backupPath);
    
    if (sourceFiles === backupFiles) {
      console.log(`✅ images 폴더 백업 완료 (${sourceFiles}개 파일)`);
    } else {
      throw new Error(`백업 파일 개수 불일치: 원본 ${sourceFiles}, 백업 ${backupFiles}`);
    }
    
  } catch (error) {
    console.error('❌ images 폴더 백업 실패:', error.message);
    throw error;
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

async function countFiles(dirPath) {
  let count = 0;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += await countFiles(path.join(dirPath, entry.name));
      } else {
        count++;
      }
    }
  } catch (error) {
    // 디렉토리가 없으면 0 반환
    return 0;
  }
  
  return count;
}

async function createBackupInfo(timestamp, backupDir) {
  const backupInfo = {
    timestamp,
    created_at: new Date().toISOString(),
    backup_type: 'image_integration_preparation',
    files_backed_up: [
      'src/data/products.json',
      'public/images/'
    ],
    restore_commands: [
      `cp src/data/products.json.backup-${timestamp} src/data/products.json`,
      `rm -rf public/images && cp -r public/images-backup-${timestamp} public/images`
    ],
    verification: {
      products_json_backup: `src/data/products.json.backup-${timestamp}`,
      images_folder_backup: `public/images-backup-${timestamp}`
    }
  };
  
  const infoPath = path.join(backupDir, 'backup-info.json');
  await fs.writeFile(infoPath, JSON.stringify(backupInfo, null, 2));
  console.log(`📋 백업 정보 저장: ${infoPath}`);
}

async function createRestoreScript(timestamp) {
  const restoreScript = `#!/usr/bin/env node

// 🔄 백업 복원 스크립트 (자동 생성)
// 생성 시간: ${new Date().toISOString()}

import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd();

async function restore() {
  console.log('🔄 백업 복원 시작...');
  
  try {
    // products.json 복원
    const productsBackup = path.join(PROJECT_ROOT, 'src', 'data', 'products.json.backup-${timestamp}');
    const productsOriginal = path.join(PROJECT_ROOT, 'src', 'data', 'products.json');
    
    await fs.copyFile(productsBackup, productsOriginal);
    console.log('✅ products.json 복원 완료');
    
    // images 폴더 복원
    const imagesBackup = path.join(PROJECT_ROOT, 'public', 'images-backup-${timestamp}');
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
`;

  const scriptPath = path.join(PROJECT_ROOT, 'scripts', `restore-backup-${timestamp}.mjs`);
  await fs.writeFile(scriptPath, restoreScript);
  console.log(`🔄 복원 스크립트 생성: ${scriptPath}`);
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  createBackup().catch(error => {
    console.error('❌ 백업 시스템 오류:', error);
    process.exit(1);
  });
}

export { createBackup };
