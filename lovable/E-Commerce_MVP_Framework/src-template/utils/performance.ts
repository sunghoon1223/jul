/**
 * 성능 최적화 유틸리티
 * 프로덕션 환경에서 console 로그 제거 및 기타 최적화 기능
 */

// 프로덕션 환경에서 console 로그 제거
export const setupProductionOptimizations = () => {
  if (import.meta.env.PROD) {
    // console 메서드들을 빈 함수로 대체
    console.log = () => {}
    console.warn = () => {}
    console.info = () => {}
    // console.error는 프로덕션에서도 유지 (중요한 오류 추적을 위해)
  }
}

// 이미지 지연 로딩 최적화
export const optimizeImageLoading = () => {
  // Intersection Observer를 사용한 이미지 지연 로딩
  const images = document.querySelectorAll('img[data-src]')
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      const imageElement = img as HTMLImageElement
      imageElement.src = imageElement.dataset.src!
    })
  }
}

// 메모리 누수 방지를 위한 이벤트 리스너 정리
export const cleanupEventListeners = () => {
  // React의 cleanup 함수에서 사용할 수 있는 유틸리티
  return () => {
    // Custom cleanup logic here
  }
}

// 번들 크기 분석을 위한 로그 (개발 환경에서만)
export const logBundleInfo = () => {
  if (import.meta.env.DEV) {
    console.log('🎯 Performance Monitoring Active')
    console.log('📦 Current Bundle Mode:', import.meta.env.MODE)
    console.log('🔧 Development Tools Available')
  }
}

// 웹 폰트 최적화
export const optimizeWebFonts = () => {
  // 폰트 디스플레이 최적화
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = 'https://fonts.googleapis.com'
  document.head.appendChild(link)

  const link2 = document.createElement('link')
  link2.rel = 'preconnect'
  link2.href = 'https://fonts.gstatic.com'
  link2.crossOrigin = 'anonymous'
  document.head.appendChild(link2)
}

// Service Worker 등록 (캐싱 최적화)
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered: ', registration)
    } catch (registrationError) {
      console.error('SW registration failed: ', registrationError)
    }
  }
}

// 리소스 프리로딩
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/data/products.json',
    '/data/categories.json'
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = 'fetch'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// 성능 메트릭 수집
export const collectPerformanceMetrics = () => {
  if (import.meta.env.PROD) {
    // Web Vitals 메트릭 수집
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          // 실제 프로덕션에서는 분석 서비스로 전송
          if (import.meta.env.DEV) {
            console.log('📊 Performance Metric:', entry.name, entry.value)
          }
        })
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
    }
  }
}

// 전체 성능 최적화 초기화
export const initializePerformanceOptimizations = () => {
  setupProductionOptimizations()
  optimizeWebFonts()
  preloadCriticalResources()
  collectPerformanceMetrics()
  logBundleInfo()
  
  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImageLoading()
      registerServiceWorker()
    })
  } else {
    optimizeImageLoading()
    registerServiceWorker()
  }
}