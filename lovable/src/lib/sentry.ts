import * as Sentry from "@sentry/react";

// 🚀 JPCaster Sentry 설정 - 통합 에러 모니터링
export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "https://your-dsn@sentry.io/project-id",
    environment: import.meta.env.MODE || "development",
    debug: import.meta.env.MODE === "development",
    
    // 성능 모니터링
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
    
    // 세션 추적
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    
    // 사용자 정의 태그
    initialScope: {
      tags: {
        component: "jpcaster-web",
        version: "1.0.0"
      }
    },
    
    // 에러 필터링
    beforeSend(event, hint) {
      // 개발 모드에서는 콘솔에도 출력
      if (import.meta.env.MODE === "development") {
        console.error("🚨 Sentry Error:", hint.originalException || event.message);
      }
      return event;
    }
  });
};

// 이미지 매칭 전용 Sentry 헬퍼
export const ImageMatchingSentry = {
  // 매칭 시작 추적
  startMatching: (productCount: number) => {
    return Sentry.startSpan(
      { name: "image_matching_process" },
      () => {
        Sentry.setTag("operation", "image_matching");
        Sentry.setContext("matching_info", {
          total_products: productCount,
          timestamp: new Date().toISOString()
        });
        console.log(`🔍 이미지 매칭 시작: ${productCount}개 제품`);
      }
    );
  },
  
  // 매칭 성공 기록
  logSuccess: (productId: string, originalUrl: string, matchedFile: string) => {
    Sentry.addBreadcrumb({
      message: "Image match success",
      category: "image_matching",
      data: {
        product_id: productId,
        original_url: originalUrl,
        matched_file: matchedFile
      },
      level: "info"
    });
  },
  
  // 매칭 실패 기록
  logFailure: (productId: string, originalUrl: string, reason: string) => {
    Sentry.captureMessage(`Image matching failed: ${reason}`, {
      level: "warning",
      tags: {
        product_id: productId,
        failure_reason: reason
      },
      extra: {
        original_url: originalUrl
      }
    });
  },
  
  // 최종 결과 기록
  logResults: (results: {
    total: number;
    matched: number;
    failed: number;
    success_rate: number;
  }) => {
    Sentry.setContext("matching_results", results);
    Sentry.captureMessage(`Image matching completed: ${results.success_rate}% success rate`, {
      level: results.success_rate > 80 ? "info" : "warning"
    });
    console.log(`✅ 매칭 완료: ${results.matched}/${results.total} (${results.success_rate}%)`);
  }
};
