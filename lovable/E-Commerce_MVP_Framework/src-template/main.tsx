import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { initializePerformanceOptimizations } from './utils/performance'
// import { initSentry } from './lib/sentry.ts'

// 전역 에러 핸들링 (프로덕션 디버깅용)
window.addEventListener('error', (event) => {
  console.error('🚨 전역 JavaScript 에러:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 처리되지 않은 Promise 거부:', event.reason);
});

// 환경변수 디버깅 로그
console.log('🔧 환경변수 상태:', {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  geminiKeyPrefix: import.meta.env.VITE_GEMINI_API_KEY?.substring(0, 10)
});

// 성능 최적화 초기화
initializePerformanceOptimizations()

// Temporarily disabled Sentry for debugging
// initSentry();

// React Query 클라이언트 생성 (환경별 최적화 설정)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 백그라운드에서 재요청 설정 (환경별)
      refetchOnWindowFocus: import.meta.env.PROD ? false : true,
      // 캐시 설정 최적화
      staleTime: import.meta.env.PROD ? 5 * 60 * 1000 : 0, // 프로덕션: 5분, 개발: 0
      gcTime: import.meta.env.PROD ? 10 * 60 * 1000 : 0, // 프로덕션: 10분, 개발: 0
      // 에러 시 재시도 최적화
      retry: import.meta.env.PROD ? 3 : 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

const root = ReactDOM.createRoot(document.getElementById('root')!)

// 즉시 앱 렌더링 (DOMContentLoaded 이벤트 대기하지 않음)
root.render(
  // Temporarily disabled StrictMode to fix admin login state issues
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  // </React.StrictMode>
)

// 앱 로딩 완료 후 초기 로더 숨기기
setTimeout(() => {
  if (window.hideInitialLoader) {
    window.hideInitialLoader()
  }
}, 1000)

// 타입 정의
declare global {
  interface Window {
    hideInitialLoader?: () => void
  }
}