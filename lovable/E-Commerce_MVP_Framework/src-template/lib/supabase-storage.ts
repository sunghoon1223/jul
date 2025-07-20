/**
 * Supabase Storage 이미지 URL 변환 유틸리티
 * 로컬 이미지 경로를 Supabase Storage 공개 URL로 변환합니다.
 */

const SUPABASE_URL = "https://bjqadhzkoxdwyfsglrvq.supabase.co";
const STORAGE_BUCKET = "product-images";

/**
 * 이미지 경로를 적절한 URL로 변환합니다.
 * Lovable 플랫폼에서는 이미지가 /lovable-uploads/ 경로에 저장됩니다.
 * @param imagePath - 원본 이미지 경로
 * @returns 이미지 URL 또는 플레이스홀더
 */
export const createSupabaseImageUrl = (imagePath: string | null | undefined): string => {
  // 빈 값이나 null 처리
  if (!imagePath || imagePath.trim() === '') {
    console.log('⚠️ Empty image path, using placeholder');
    return '/images/placeholder.svg';
  }
  
  // 이미 완전한 URL인 경우 그대로 반환
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ Full URL found:', imagePath);
    return imagePath;
  }
  
  // Lovable 플랫폼의 이미지 경로 처리
  if (imagePath.startsWith('/lovable-uploads/')) {
    console.log('✅ Lovable upload path found:', imagePath);
    return imagePath;
  }
  
  // 로컬 이미지 경로 처리
  if (imagePath.startsWith('/images/')) {
    console.log('✅ Local image path found:', imagePath);
    // Lovable에서는 public 폴더의 이미지를 직접 참조 가능
    return imagePath;
  }
  
  // 상대 경로인 경우 처리
  if (imagePath.startsWith('images/')) {
    const correctedPath = `/${imagePath}`;
    console.log('✅ Relative path corrected:', correctedPath);
    return correctedPath;
  }
  
  // 파일명만 있는 경우
  if (!imagePath.includes('/')) {
    const correctedPath = `/images/${imagePath}`;
    console.log('✅ Filename only, path corrected to:', correctedPath);
    return correctedPath;
  }
  
  // 기본적으로 원본 경로 반환
  console.log('✅ Using original path:', imagePath);
  return imagePath;
};

/**
 * 이미지 URL 배열을 처리합니다.
 * @param imageUrls - 이미지 URL 배열
 * @returns 변환된 이미지 URL 배열
 */
export const processImageUrls = (imageUrls: string[] | null | undefined): string[] => {
  if (!imageUrls || !Array.isArray(imageUrls)) return [];
  
  return imageUrls.map(url => createSupabaseImageUrl(url));
};

/**
 * 제품 데이터의 이미지 URL들을 일괄 처리합니다.
 * @param product - 제품 데이터
 * @returns 이미지 URL이 변환된 제품 데이터
 */
export const processProductImages = (product: any) => {
  if (!product) return product;
  
  return {
    ...product,
    main_image_url: createSupabaseImageUrl(product.main_image_url),
    image_urls: processImageUrls(product.image_urls)
  };
};