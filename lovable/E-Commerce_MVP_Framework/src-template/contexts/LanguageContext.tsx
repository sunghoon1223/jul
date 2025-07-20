import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'ko' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  ko: {
    // Header
    'header.support': '고객지원',
    'header.quality': '품질보증',
    'header.dealers': '대리점',
    'header.login': '로그인',
    'header.signup': '회원가입',
    'header.logout': '로그아웃',
    'header.admin': '관리자',
    'header.search': '제품, 카테고리 검색...',
    
    // Navigation
    'nav.company': '회사소개',
    'nav.agv-caster': 'AGV 캐스터',
    'nav.equipment-caster': '장비용 캐스터',
    'nav.polyurethane-wheel': '폴리우레탄 휠',
    'nav.rubber-wheel': '러버 휠',
    'nav.driving-module': '드라이빙 모듈',
    'nav.notices': '공지사항',
    'nav.support': '고객지원',
    
    // Mega Menu
    'megamenu.allMenu': '전체 메뉴',
    'megamenu.productCategory': '제품 카테고리',
    'megamenu.allProducts': '전체 제품',
    'megamenu.heavyDutyCasters': '중하중 캐스터',
    'megamenu.mecanumWheels': '메카넘 휠',
    'megamenu.companyInfo': '회사 정보',
    'megamenu.aboutCompany': '회사 소개',
    'megamenu.qualityAssurance': '품질 보증',
    'megamenu.dealers': '대리점',
    'megamenu.customerSupport': '고객 지원',
    'megamenu.notices': '공지사항',
    'megamenu.techSupport': '기술 지원',
    'megamenu.contact': '문의하기',
    'megamenu.downloads': '다운로드',
    'megamenu.description': '전문 캐스터 솔루션을 위한 모든 제품과 서비스를 한 곳에서 확인하세요',
    
    // Footer
    'footer.company': 'Korean Caster',
    'footer.companyDesc': '10년 이상의 경험을 바탕으로 산업용 캐스터와 휠 전문 제조업체로서 최고 품질의 솔루션을 제공합니다.',
    'footer.quickLinks': '빠른 링크',
    'footer.about': '회사소개',
    'footer.catalog': '제품 카탈로그',
    'footer.techSupport': '기술지원',
    'footer.quality': '품질보증',
    'footer.customerSupport': '고객지원',
    'footer.productCategories': '제품 카테고리',
    'footer.contact': '연락처',
    'footer.address1': '서울시 강남구 테헤란로 123',
    'footer.address2': '',
    'footer.copyright': '© 2024 Korean Caster. All rights reserved.',
    'footer.privacy': '개인정보처리방침',
    'footer.terms': '이용약관',
    'footer.sitemap': '사이트맵',
    
    // Category names
    'category.driving-module': '드라이빙 모듈',
    'category.agv-caster': 'AGV 캐스터',
    'category.equipment-caster': '장비용 캐스터',
    'category.polyurethane-wheel': '폴리우레탄 휠',
    'category.rubber-wheel': '러버 휠',
    
    // Common
    'common.home': '홈',
    'common.products': '제품',
    'common.price': '가격',
    'common.quantity': '수량',
    'common.addToCart': '장바구니에 담기',
    'common.buyNow': '바로 주문하기',
    'common.contact': '문의하기',
    'common.learnMore': '더 알아보기',
    'common.viewProducts': '제품 보기',
    'common.inStock': '재고 있음',
    'common.outOfStock': '품절',
    'common.search': '검색',
    'common.filter': '필터',
    'common.sort': '정렬',
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.next': '다음',
    'common.previous': '이전',
    'common.submit': '제출',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.edit': '수정',
    'common.delete': '삭제',
    'common.view': '보기',
    'common.close': '닫기',
    
    // Hero Section
    'hero.title': '산업용 캐스터 전문 제조업체',
    'hero.subtitle': '최고 품질의 AGV 캐스터, 장비용 캐스터, 폴리우레탄 휠 솔루션',
    'hero.description': 'JP CASTER는 10년 이상의 경험을 바탕으로 산업용 캐스터와 휠 전문 제조업체로서 AGV, 장비용, 중하중 캐스터 등 다양한 솔루션을 제공합니다.',
    'hero.viewCatalog': '제품 카탈로그 보기',
    'hero.contactUs': '문의하기',
    
    // Product Categories Section
    'categories.title': '제품 카테고리',
    'categories.subtitle': '다양한 산업 분야에 최적화된 캐스터 솔루션을 제공합니다',
    'categories.agv.title': 'AGV 캐스터',
    'categories.agv.description': '무인 운반차량 전용 고정밀 캐스터',
    'categories.industrial.title': '장비용 캐스터',
    'categories.industrial.description': '산업용 장비 및 기계용 고내구성 캐스터',
    'categories.heavy.title': '중하중 캐스터',
    'categories.heavy.description': '고하중 지지용 초중량 캐스터',
    'categories.polyurethane.title': '폴리우레탄 휠',
    'categories.polyurethane.description': '고성능 폴리우레탄 소재 휠 및 캐스터',
    'categories.rubber.title': '러버 휠',
    'categories.rubber.description': '고무 소재 휠 및 방진 캐스터',
    'categories.mecanum.title': '메카넘 휠',
    'categories.mecanum.description': '360도 전방향 이동 가능한 메카넘 휠',
    'categories.driving.title': '드라이빙 모듈',
    'categories.driving.description': '모터 일체형 구동 모듈',
    
    // Featured Products Section
    'featured.title': '추천 제품',
    'featured.subtitle': '고객들이 가장 많이 찾는 인기 제품들을 확인해보세요',
    'featured.viewMore': '더 많은 제품 보기',
    
    // Notice Section
    'notice.title': 'NOTICE',
    'notice.subtitle': 'JP CASTER의 최신 소식과 중요한 공지사항을 확인하세요',
    'notice.viewAll': '전체 공지사항 보기',
    'notice.views': '조회',
    'notice.author': '작성자',
    'notice.date': '날짜',
    'notice.category': '카테고리',
    
    // Footer Sections
    'footer.notice.title': 'NOTICE',
    'footer.store.title': 'STORE',
    'footer.customerCenter.title': 'CUSTOMER CENTER',
    'footer.store.findDealer': '전국 대리점 찾기',
    'footer.store.seoul': '서울 강남점',
    'footer.store.busan': '부산 해운대점',
    'footer.store.daegu': '대구 수성점',
    'footer.store.open': '영업중',
    'footer.store.closed': '영업종료',
    'footer.store.viewAll': '전체 매장 보기',
    'footer.customerCenter.phone': '1588-1234',
    'footer.customerCenter.consultation': '상담 전용 번호',
    'footer.customerCenter.weekday': '평일',
    'footer.customerCenter.saturday': '토요일',
    'footer.customerCenter.weekdayTime': '09:00-18:00',
    'footer.customerCenter.saturdayTime': '09:00-15:00',
    'footer.customerCenter.onlineInquiry': '온라인 문의하기',
    'footer.customerCenter.faq': 'FAQ 바로가기',
    'footer.certification.title': '인증 및 보증',
    'footer.certification.iso': 'ISO 9001 품질경영시스템',
    'footer.certification.kc': 'KC 안전인증',
    'footer.certification.warranty': '1년 품질보증',
    'footer.certification.service': '전국 A/S 네트워크',
    'footer.noNotices': '공지사항이 없습니다.',
    
    // Hero Slides
    'hero.agv.title': 'AGV 캐스터 솔루션',
    'hero.agv.subtitle': '자동화 설비를 위한 정밀 캐스터',
    'hero.agv.description': '무인 운반차량(AGV)에 최적화된 고성능 캐스터로 자동화 시스템의 효율성을 극대화하세요.',
    'hero.agv.cta': 'AGV 캐스터 보기',
    'hero.mecanum.title': '메카넘 휠 기술',
    'hero.mecanum.subtitle': '360도 전방향 이동',
    'hero.mecanum.description': '로봇공학의 혁신을 이끄는 메카넘 휠 기술로 무한한 이동의 자유를 경험하세요.',
    'hero.mecanum.cta': '메카넘 휠 보기',
    'hero.custom.title': 'CUSTOM SOLUTIONS',
    'hero.custom.subtitle': '고객 요구사항에 맞춤 설계된 특별한 캐스터 제작 서비스',
    'hero.custom.description': '설계부터 제작까지 원스톱 서비스로 고객만의 특별한 캐스터를 제작해드립니다.',
    'hero.custom.cta': '상담 신청하기',
    'hero.quality.title': '품질 보증 시스템',
    'hero.quality.subtitle': 'ISO 9001 인증',
    'hero.quality.description': '엄격한 품질 관리 시스템과 20년 노하우로 최상의 제품 품질을 보장합니다.',
    'hero.quality.cta': '품질 보증 보기',
    'hero.main.title': '산업용 캐스터 전문',
    'hero.main.subtitle': 'JP캐스터',
    'hero.main.description': 'AGV부터 메카넘 휠까지, 20년 경험의 캐스터 전문 기업. 최고 품질의 산업용 캐스터 솔루션을 제공합니다.',
    'hero.main.cta': '제품 카탈로그 보기',
  },
  
  en: {
    // Header
    'header.support': 'Support',
    'header.quality': 'Quality',
    'header.dealers': 'Dealers',
    'header.login': 'Login',
    'header.signup': 'Sign Up',
    'header.logout': 'Logout',
    'header.admin': 'Admin',
    'header.search': 'Search products, categories...',
    
    // Navigation
    'nav.company': 'Company',
    'nav.agv-caster': 'AGV Caster',
    'nav.equipment-caster': 'Equipment Caster',
    'nav.polyurethane-wheel': 'Polyurethane Wheel',
    'nav.rubber-wheel': 'Rubber Wheel',
    'nav.driving-module': 'Driving Module',
    'nav.notices': 'Notice',
    'nav.support': 'Support',
    
    // Mega Menu
    'megamenu.allMenu': 'All Menu',
    'megamenu.productCategory': 'Product Categories',
    'megamenu.allProducts': 'All Products',
    'megamenu.heavyDutyCasters': 'Heavy Duty Casters',
    'megamenu.mecanumWheels': 'Mecanum Wheels',
    'megamenu.companyInfo': 'Company Info',
    'megamenu.aboutCompany': 'About Company',
    'megamenu.qualityAssurance': 'Quality Assurance',
    'megamenu.dealers': 'Dealers',
    'megamenu.customerSupport': 'Customer Support',
    'megamenu.notices': 'Notice',
    'megamenu.techSupport': 'Technical Support',
    'megamenu.contact': 'Contact Us',
    'megamenu.downloads': 'Downloads',
    'megamenu.description': 'Find all products and services for professional caster solutions in one place',
    
    // Footer
    'footer.company': 'Korean Caster',
    'footer.companyDesc': 'With over 10 years of experience, we are a specialized manufacturer of industrial casters and wheels, providing the highest quality solutions.',
    'footer.quickLinks': 'Quick Links',
    'footer.about': 'About',
    'footer.catalog': 'Product Catalog',
    'footer.techSupport': 'Technical Support',
    'footer.quality': 'Quality Assurance',
    'footer.customerSupport': 'Customer Support',
    'footer.productCategories': 'Product Categories',
    'footer.contact': 'Contact',
    'footer.address1': '123 Teheran-ro, Gangnam-gu, Seoul',
    'footer.address2': '',
    'footer.copyright': '© 2024 Korean Caster. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.sitemap': 'Sitemap',
    
    // Category names
    'category.driving-module': 'Driving Module',
    'category.agv-caster': 'AGV Caster',
    'category.equipment-caster': 'Equipment Caster',
    'category.polyurethane-wheel': 'Polyurethane Wheel',
    'category.rubber-wheel': 'Rubber Wheel',
    
    // Common
    'common.home': 'Home',
    'common.products': 'Products',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.addToCart': 'Add to Cart',
    'common.buyNow': 'Buy Now',
    'common.contact': 'Contact',
    'common.learnMore': 'Learn More',
    'common.viewProducts': 'View Products',
    'common.inStock': 'In Stock',
    'common.outOfStock': 'Out of Stock',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.close': 'Close',
    
    // Hero Section
    'hero.title': 'Industrial Caster Specialist Manufacturer',
    'hero.subtitle': 'Premium Quality AGV Casters, Equipment Casters, and Polyurethane Wheel Solutions',
    'hero.description': 'JP CASTER is a specialized manufacturer of industrial casters and wheels with over 10 years of experience, providing various solutions including AGV, equipment, and heavy-duty casters.',
    'hero.viewCatalog': 'View Product Catalog',
    'hero.contactUs': 'Contact Us',
    
    // Product Categories Section
    'categories.title': 'Product Categories',
    'categories.subtitle': 'We provide optimized caster solutions for various industrial fields',
    'categories.agv.title': 'AGV Casters',
    'categories.agv.description': 'High-precision casters for automated guided vehicles',
    'categories.industrial.title': 'Equipment Casters',
    'categories.industrial.description': 'High-durability casters for industrial equipment and machinery',
    'categories.heavy.title': 'Heavy Duty Casters',
    'categories.heavy.description': 'Ultra-heavy casters for high load support',
    'categories.polyurethane.title': 'Polyurethane Wheels',
    'categories.polyurethane.description': 'High-performance polyurethane material wheels and casters',
    'categories.rubber.title': 'Rubber Wheels',
    'categories.rubber.description': 'Rubber material wheels and vibration-damping casters',
    'categories.mecanum.title': 'Mecanum Wheels',
    'categories.mecanum.description': '360-degree omnidirectional mecanum wheels',
    'categories.driving.title': 'Driving Modules',
    'categories.driving.description': 'Motor-integrated drive modules',
    
    // Featured Products Section
    'featured.title': 'Featured Products',
    'featured.subtitle': 'Check out the most popular products our customers love',
    'featured.viewMore': 'View More Products',
    
    // Notice Section
    'notice.title': 'NOTICE',
    'notice.subtitle': 'Check the latest news and important notices from JP CASTER',
    'notice.viewAll': 'View All Notices',
    'notice.views': 'Views',
    'notice.author': 'Author',
    'notice.date': 'Date',
    'notice.category': 'Category',
    
    // Footer Sections
    'footer.notice.title': 'NOTICE',
    'footer.store.title': 'STORE',
    'footer.customerCenter.title': 'CUSTOMER CENTER',
    'footer.store.findDealer': 'Find Nationwide Dealers',
    'footer.store.seoul': 'Seoul Gangnam Branch',
    'footer.store.busan': 'Busan Haeundae Branch',
    'footer.store.daegu': 'Daegu Suseong Branch',
    'footer.store.open': 'Open',
    'footer.store.closed': 'Closed',
    'footer.store.viewAll': 'View All Stores',
    'footer.customerCenter.phone': '1588-1234',
    'footer.customerCenter.consultation': 'Consultation Hotline',
    'footer.customerCenter.weekday': 'Weekdays',
    'footer.customerCenter.saturday': 'Saturday',
    'footer.customerCenter.weekdayTime': '09:00-18:00',
    'footer.customerCenter.saturdayTime': '09:00-15:00',
    'footer.customerCenter.onlineInquiry': 'Online Inquiry',
    'footer.customerCenter.faq': 'FAQ Center',
    'footer.certification.title': 'Certification & Warranty',
    'footer.certification.iso': 'ISO 9001 Quality Management System',
    'footer.certification.kc': 'KC Safety Certification',
    'footer.certification.warranty': '1 Year Quality Warranty',
    'footer.certification.service': 'Nationwide A/S Network',
    'footer.noNotices': 'No notices available.',
    
    // Hero Slides
    'hero.agv.title': 'AGV Caster Solutions',
    'hero.agv.subtitle': 'Precision Casters for Automation Equipment',
    'hero.agv.description': 'Maximize the efficiency of automation systems with high-performance casters optimized for Automated Guided Vehicles (AGV).',
    'hero.agv.cta': 'View AGV Casters',
    'hero.mecanum.title': 'Mecanum Wheel Technology',
    'hero.mecanum.subtitle': '360-Degree Omnidirectional Movement',
    'hero.mecanum.description': 'Experience unlimited freedom of movement with mecanum wheel technology that leads innovation in robotics.',
    'hero.mecanum.cta': 'View Mecanum Wheels',
    'hero.custom.title': 'CUSTOM SOLUTIONS',
    'hero.custom.subtitle': 'Special Caster Manufacturing Service Designed to Customer Requirements',
    'hero.custom.description': 'We provide one-stop service from design to manufacturing to create special casters just for our customers.',
    'hero.custom.cta': 'Request Consultation',
    'hero.quality.title': 'Quality Assurance System',
    'hero.quality.subtitle': 'ISO 9001 Certified',
    'hero.quality.description': 'We guarantee the highest product quality with strict quality management systems and 20 years of expertise.',
    'hero.quality.cta': 'View Quality Assurance',
    'hero.main.title': 'Industrial Caster Specialist',
    'hero.main.subtitle': 'JP Caster',
    'hero.main.description': 'From AGV to mecanum wheels, a caster specialist company with 20 years of experience. We provide the highest quality industrial caster solutions.',
    'hero.main.cta': 'View Product Catalog',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko')

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations['ko']]
    return translation || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}