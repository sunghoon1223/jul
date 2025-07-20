-- 실제 캐스터 제품 데이터 삽입
-- 먼저 카테고리 데이터 삽입
INSERT INTO categories (name, slug, description) VALUES
('AGV 캐스터', 'agv-casters', '자동화 무인 운반차량(AGV)용 정밀 캐스터'),
('장비용 캐스터', 'equipment-casters', '산업 장비 및 기계용 중하중 캐스터'),
('폴리우레탄 휠', 'polyurethane-wheels', '내마모성이 뛰어난 폴리우레탄 소재 휠'),
('고무 휠', 'rubber-wheels', '충격 흡수가 우수한 고무 소재 휠'),
('구동 모듈', 'drive-modules', '전동식 이동 및 조향이 가능한 구동 모듈'),
('메카넘 휠', 'mecanum-wheels', '360도 전방향 이동이 가능한 메카넘 휠')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 실제 제품 데이터 삽입
INSERT INTO products (name, slug, description, price, sku, stock_quantity, manufacturer, category_id, main_image_url, image_urls, features, is_published) VALUES

-- AGV 캐스터 제품들
('AGV-PRO-100 정밀 캐스터', 'agv-pro-100', '고정밀 AGV 시스템을 위한 프리미엄 캐스터. 최대 하중 100kg, 정밀 베어링 적용으로 소음 최소화.', 245000, 'AGV-100-001', 50, 'JP캐스터', 
 (SELECT id FROM categories WHERE slug = 'agv-casters'), 
 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'],
 '{"하중용량": "100kg", "소재": "스테인리스 스틸", "베어링": "정밀 볼베어링", "소음레벨": "< 40dB", "작동온도": "-20°C ~ +80°C"}', true),

('AGV-ECO-75 경제형 캐스터', 'agv-eco-75', '경제적이면서도 안정적인 AGV용 캐스터. 중소형 AGV 시스템에 최적화.', 185000, 'AGV-075-002', 80, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'agv-casters'),
 'https://images.unsplash.com/photo-1565087447937-4ab7c5fd1b45?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1565087447937-4ab7c5fd1b45?w=800&h=600&fit=crop'],
 '{"하중용량": "75kg", "소재": "알루미늄 합금", "베어링": "표준 볼베어링", "소음레벨": "< 45dB"}', true),

-- 장비용 캐스터 제품들
('HD-CAST-200 중하중 캐스터', 'hd-cast-200', '산업 장비용 중하중 캐스터. 최대 200kg 하중 지원, 강화 프레임 구조.', 320000, 'HD-200-001', 30, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'equipment-casters'),
 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'],
 '{"하중용량": "200kg", "소재": "강화 스틸", "휠직경": "125mm", "브레이크": "더블 브레이크"}', true),

('IND-SWIVEL-150 회전 캐스터', 'ind-swivel-150', '360도 자유 회전이 가능한 산업용 캐스터. 높은 기동성과 내구성.', 275000, 'IND-150-003', 45, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'equipment-casters'),
 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'],
 '{"하중용량": "150kg", "회전각도": "360도", "소재": "주철", "휠직경": "100mm"}', true),

-- 폴리우레탄 휠 제품들
('PU-WHEEL-80 폴리우레탄 휠', 'pu-wheel-80', '내마모성이 뛰어난 폴리우레탄 휠. 바닥 손상 방지, 조용한 이동.', 95000, 'PU-080-001', 120, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'polyurethane-wheels'),
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'],
 '{"휠직경": "80mm", "소재": "폴리우레탄", "경도": "85A", "최대하중": "80kg", "바닥보호": "우수"}', true),

('PU-PREMIUM-100 프리미엄 휠', 'pu-premium-100', '최고급 폴리우레탄 소재로 제작된 프리미엄 휠. 극한의 내구성과 성능.', 145000, 'PU-100-002', 75, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'polyurethane-wheels'),
 'https://images.unsplash.com/photo-1581092795442-6ce0a6a54a20?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1581092795442-6ce0a6a54a20?w=800&h=600&fit=crop'],
 '{"휠직경": "100mm", "소재": "프리미엄 폴리우레탄", "경도": "90A", "최대하중": "120kg"}', true),

-- 고무 휠 제품들
('RUBBER-SOFT-75 소프트 고무휠', 'rubber-soft-75', '충격 흡수가 뛰어난 소프트 고무 휠. 진동 감소 및 소음 차단.', 75000, 'RB-075-001', 90, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'rubber-wheels'),
 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop'],
 '{"휠직경": "75mm", "소재": "천연고무", "경도": "60A", "충격흡수": "우수", "최대하중": "60kg"}', true),

-- 구동 모듈 제품들
('DRIVE-MOD-250 전동 구동모듈', 'drive-mod-250', '전동 모터가 내장된 구동 모듈. 정밀한 속도 제어와 위치 제어 가능.', 850000, 'DM-250-001', 15, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'drive-modules'),
 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'],
 '{"모터출력": "250W", "최대속도": "2m/s", "하중용량": "300kg", "제어방식": "서보제어", "전압": "24V DC"}', true),

-- 메카넘 휠 제품들
('MECANUM-PRO-127 메카넘 휠', 'mecanum-pro-127', '360도 전방향 이동이 가능한 메카넘 휠. 로봇 및 AGV의 고급 기동성 구현.', 420000, 'MC-127-001', 25, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'mecanum-wheels'),
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'],
 '{"휠직경": "127mm", "소재": "알루미늄+고무", "최대하중": "150kg", "롤러개수": "9개", "회전방향": "좌/우회전"}', true),

('MECANUM-ECO-100 경제형 메카넘', 'mecanum-eco-100', '경제적인 가격의 메카넘 휠. 교육용 및 소형 로봇에 적합.', 280000, 'MC-100-002', 40, 'JP캐스터',
 (SELECT id FROM categories WHERE slug = 'mecanum-wheels'),
 'https://images.unsplash.com/photo-1581092795442-6ce0a6a54a20?w=800&h=600&fit=crop',
 ARRAY['https://images.unsplash.com/photo-1581092795442-6ce0a6a54a20?w=800&h=600&fit=crop'],
 '{"휠직경": "100mm", "소재": "플라스틱+고무", "최대하중": "80kg", "롤러개수": "7개"}', true)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  main_image_url = EXCLUDED.main_image_url,
  image_urls = EXCLUDED.image_urls,
  features = EXCLUDED.features;