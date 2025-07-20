#!/usr/bin/env node

// Supabase Storage 설정 스크립트
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = "https://bjqadhzkoxdwyfsglrvq.supabase.co"
const SUPABASE_SERVICE_KEY = "sb_secret_RSJ16hYdT_wobIQnqKLzbQ_JwUPDlmP"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...')
  
  try {
    // 1. 버킷 목록 확인
    console.log('📋 Checking existing buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError)
      return
    }
    
    console.log('📊 Existing buckets:', buckets?.map(b => b.name) || [])
    
    // 2. product-images 버킷 생성 (public)
    const bucketName = 'product-images'
    const existingBucket = buckets?.find(b => b.name === bucketName)
    
    if (!existingBucket) {
      console.log(`📦 Creating ${bucketName} bucket...`)
      const { data: bucketData, error: bucketError } = await supabase.storage
        .createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        })
      
      if (bucketError) {
        console.error(`❌ Failed to create ${bucketName} bucket:`, bucketError)
        return
      }
      
      console.log(`✅ ${bucketName} bucket created successfully`)
    } else {
      console.log(`✅ ${bucketName} bucket already exists`)
    }
    
    // 3. 로컬 이미지 파일 확인
    const imagesDir = path.join(__dirname, '../dist/images')
    if (!fs.existsSync(imagesDir)) {
      console.log('⚠️ Local images directory not found, skipping upload')
      return
    }
    
    // 4. 이미지 파일 업로드
    console.log('📤 Uploading images to Supabase Storage...')
    const imageFiles = fs.readdirSync(imagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(dirent.name))
      .map(dirent => dirent.name)
    
    console.log(`📊 Found ${imageFiles.length} image files to upload`)
    
    let uploadCount = 0
    let errorCount = 0
    
    for (const fileName of imageFiles) {
      try {
        const filePath = path.join(imagesDir, fileName)
        const fileBuffer = fs.readFileSync(filePath)
        
        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileBuffer, {
            contentType: `image/${path.extname(fileName).slice(1)}`,
            upsert: true
          })
        
        if (uploadError) {
          console.error(`❌ Failed to upload ${fileName}:`, uploadError.message)
          errorCount++
        } else {
          console.log(`✅ Uploaded: ${fileName}`)
          uploadCount++
        }
        
        // 서버 부하 방지
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message)
        errorCount++
      }
    }
    
    // 5. 업로드 결과 보고
    console.log('\n📊 Upload Summary:')
    console.log(`✅ Successful uploads: ${uploadCount}`)
    if (errorCount > 0) {
      console.log(`❌ Failed uploads: ${errorCount}`)
    }
    
    // 6. 업로드된 파일 목록 확인
    console.log('\n🔍 Verifying uploaded files...')
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list()
    
    if (listError) {
      console.error('❌ Failed to list uploaded files:', listError)
    } else {
      console.log(`📊 Total files in storage: ${files?.length || 0}`)
    }
    
    // 7. 공개 URL 예시 생성
    if (files && files.length > 0) {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(files[0].name)
      
      console.log('\n🌐 Public URL example:')
      console.log(publicUrlData.publicUrl)
    }
    
    console.log('\n🎉 Supabase Storage setup completed!')
    
  } catch (error) {
    console.error('❌ Storage setup failed:', error)
  }
}

// 스크립트 실행
setupStorage().catch(console.error)