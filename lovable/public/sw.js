// Service Worker for JPCaster E-commerce Site
// 캐싱 및 오프라인 지원을 위한 서비스 워커

const CACHE_NAME = 'jpcaster-v1.0.0'
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/data/products.json',
  '/data/categories.json',
  '/images/placeholder.svg',
  // 핵심 CSS 및 JS 파일들은 빌드 시 자동으로 추가됨
]

// 설치 이벤트 - 캐시 생성
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files')
        return cache.addAll(CACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache')
            return caches.delete(cache)
          }
        })
      )
    })
  )
})

// 가져오기 이벤트 - 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  // GET 요청만 캐시
  if (event.request.method !== 'GET') return

  // API 요청은 네트워크 우선
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase.co') ||
      event.request.url.includes('generativelanguage.googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 성공적인 응답만 캐시
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환
          return caches.match(event.request)
        })
    )
    return
  }

  // 정적 자원은 캐시 우선
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 반환, 없으면 네트워크에서 가져오기
        return response || fetch(event.request)
          .then(fetchResponse => {
            // 성공적인 응답을 캐시에 저장
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone()
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone)
                })
            }
            return fetchResponse
          })
      })
      .catch(() => {
        // 완전 오프라인 상태일 때 기본 페이지 반환
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background Sync')
    // 백그라운드에서 데이터 동기화 로직
  }
})

// 푸시 알림 처리 (선택사항)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received')
  
  const options = {
    body: event.data ? event.data.text() : 'JPCaster 업데이트',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png'
  }

  event.waitUntil(
    self.registration.showNotification('JPCaster', options)
  )
})