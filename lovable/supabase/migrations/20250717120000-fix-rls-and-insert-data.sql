-- RLS 정책 수정 및 데이터 삽입을 위한 마이그레이션
-- 2025-07-17: Claude Code를 위한 완전한 접근 권한 설정

-- 1. INSERT/UPDATE/DELETE를 위한 RLS 정책 추가
-- Categories 테이블용 정책
CREATE POLICY "Allow anonymous insert on categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on categories" 
ON public.categories 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on categories" 
ON public.categories 
FOR DELETE 
USING (true);

-- Products 테이블용 정책
CREATE POLICY "Allow anonymous insert on products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous update on products" 
ON public.products 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on products" 
ON public.products 
FOR DELETE 
USING (true);

-- 2. 기존 데이터 정리 (있다면)
DELETE FROM public.products;
DELETE FROM public.categories;

-- 3. 카테고리 데이터 삽입
INSERT INTO public.categories (name, slug, description) VALUES
('AGV 캐스터', 'agv-casters', '무인 운반차량(AGV) 전용 고성능 캐스터'),
('장비용 캐스터', 'industrial-casters', '산업용 장비 및 기계용 고내구성 캐스터'),
('중하중 캐스터', 'heavy-duty-casters', '고하중 지지용 초중량 캐스터'),
('폴리우레탄 휠', 'polyurethane-wheels', '고성능 폴리우레탄 소재 휠 및 캐스터'),
('러버 휠', 'rubber-wheels', '고무 소재 휠 및 방진 캐스터'),
('메카넘 휠', 'mecanum-wheels', '360도 전방향 이동 가능한 메카넘 휠'),
('드라이빙 모듈', 'drive-modules', '모터 일체형 구동 모듈');

-- 4. 제품 데이터 삽입 (샘플)
INSERT INTO public.products (name, slug, description, price, sku, stock_quantity, manufacturer, category_id, main_image_url, image_urls, features, is_published) VALUES

-- AGV 캐스터 제품들
('JP AGV 전용 캐스터 50mm', 'agv-exclusive-50mm', '무인 운반차량(AGV) 전용으로 설계된 고정밀 캐스터입니다. 자동화 시스템에 최적화되어 있으며, 정확한 위치 제어와 안정적인 구동력을 제공합니다.', 220000, 'JP-AGV-50', 50, 'JP Caster', 
 (SELECT id FROM public.categories WHERE slug = 'agv-casters'), 
 '/images/ABUIABACGAAgiO7CoQYooebvrAYwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAgiO7CoQYooebvrAYwoAY4oAY.jpg'],
 '{"하중용량": "300kg", "휠소재": "AGV 전용 폴리우레탄", "베어링": "정밀 볼 베어링", "온도범위": "-10°C ~ +60°C"}', true),

('AGV-PRO-100 정밀 캐스터', 'agv-pro-100', '고정밀 AGV 시스템을 위한 프리미엄 캐스터. 최대 하중 100kg, 정밀 베어링 적용으로 소음 최소화.', 245000, 'AGV-100-001', 50, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'agv-casters'),
 '/images/ABUIABACGAAg1KHDoQYousOAODCgBjigBg.jpg',
 ARRAY['/images/ABUIABACGAAg1KHDoQYousOAODCgBjigBg.jpg'],
 '{"하중용량": "100kg", "소재": "스테인리스 스틸", "베어링": "정밀 볼베어링", "소음레벨": "< 40dB"}', true),

-- 장비용 캐스터 제품들
('HD-CAST-200 중하중 캐스터', 'hd-cast-200', '산업 장비용 중하중 캐스터. 최대 200kg 하중 지원, 강화 프레임 구조.', 320000, 'HD-200-001', 30, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'industrial-casters'),
 '/images/ABUIABACGAAg25LJoQYo9JKEnwMwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAg25LJoQYo9JKEnwMwoAY4oAY.jpg'],
 '{"하중용량": "200kg", "소재": "강화 스틸", "휠직경": "125mm", "브레이크": "더블 브레이크"}', true),

('IND-SWIVEL-150 회전 캐스터', 'ind-swivel-150', '360도 자유 회전이 가능한 산업용 캐스터. 높은 기동성과 내구성.', 275000, 'IND-150-003', 45, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'industrial-casters'),
 '/images/ABUIABACGAAg277EoQYo0srl7gQwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAg277EoQYo0srl7gQwoAY4oAY.jpg'],
 '{"하중용량": "150kg", "회전각도": "360도", "소재": "주철", "휠직경": "100mm"}', true),

-- 폴리우레탄 휠 제품들
('PU-WHEEL-80 폴리우레탄 휠', 'pu-wheel-80', '내마모성이 뛰어난 폴리우레탄 휠. 바닥 손상 방지, 조용한 이동.', 95000, 'PU-080-001', 120, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'polyurethane-wheels'),
 '/images/ABUIABACGAAg2rrruQYooLfUtwEwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAg2rrruQYooLfUtwEwoAY4oAY.jpg'],
 '{"휠직경": "80mm", "소재": "폴리우레탄", "경도": "85A", "최대하중": "80kg"}', true),

('PU-PREMIUM-100 프리미엄 휠', 'pu-premium-100', '최고급 폴리우레탄 소재로 제작된 프리미엄 휠. 극한의 내구성과 성능.', 145000, 'PU-100-002', 75, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'polyurethane-wheels'),
 '/images/ABUIABACGAAg3-rEugYon5XGywEwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAg3-rEugYon5XGywEwoAY4oAY.jpg'],
 '{"휠직경": "100mm", "소재": "프리미엄 폴리우레탄", "경도": "90A", "최대하중": "120kg"}', true),

-- 메카넘 휠 제품들
('MECANUM-PRO-127 메카넘 휠', 'mecanum-pro-127', '360도 전방향 이동이 가능한 메카넘 휠. 로봇 및 AGV의 고급 기동성 구현.', 420000, 'MC-127-001', 25, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'mecanum-wheels'),
 '/images/ABUIABACGAAg3PifvgYo35jC6wEwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAg3PifvgYo35jC6wEwoAY4oAY.jpg'],
 '{"휠직경": "127mm", "소재": "알루미늄+고무", "최대하중": "150kg", "롤러개수": "9개"}', true),

('MECANUM-ECO-100 경제형 메카넘', 'mecanum-eco-100', '경제적인 가격의 메카넘 휠. 교육용 및 소형 로봇에 적합.', 280000, 'MC-100-002', 40, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'mecanum-wheels'),
 '/images/ABUIABACGAAg3qrcsQYo-6nG3AcwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAg3qrcsQYo-6nG3AcwoAY4oAY.jpg'],
 '{"휠직경": "100mm", "소재": "플라스틱+고무", "최대하중": "80kg", "롤러개수": "7개"}', true),

-- 드라이빙 모듈
('DRIVE-MOD-250 전동 구동모듈', 'drive-mod-250', '전동 모터가 내장된 구동 모듈. 정밀한 속도 제어와 위치 제어 가능.', 850000, 'DM-250-001', 15, 'JP캐스터',
 (SELECT id FROM public.categories WHERE slug = 'drive-modules'),
 '/images/ABUIABACGAAg4LHIoQYo8PTS4AMwoAY4oAY.jpg',
 ARRAY['/images/ABUIABACGAAg4LHIoQYo8PTS4AMwoAY4oAY.jpg'],
 '{"모터출력": "250W", "최대속도": "2m/s", "하중용량": "300kg", "제어방식": "서보제어"}', true);

-- 5. 삽입 결과 확인
DO $$
DECLARE
    category_count INTEGER;
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM public.categories;
    SELECT COUNT(*) INTO product_count FROM public.products;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Categories inserted: %', category_count;
    RAISE NOTICE 'Products inserted: %', product_count;
END $$;