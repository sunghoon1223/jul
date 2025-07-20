import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 변경 시 항상 맨 위로 스크롤
    // setTimeout을 사용하여 DOM 렌더링 완료 후 스크롤
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // 즉시 이동 (애니메이션 없음)
      });
    }, 0);

    console.log('⬆️ ScrollToTop - Navigated to:', pathname);
  }, [pathname]);

  return null;
}