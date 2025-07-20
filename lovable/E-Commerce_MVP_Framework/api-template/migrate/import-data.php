<?php
require_once '../config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // JSON 파일 경로
    $productsJsonPath = '../../src/data/products.json';
    $noticesJsonPath = '../../src/data/notices.json';

    echo "=== JP Caster 데이터 이전 시작 ===\n\n";

    // 1. 제품 데이터 이전
    if (file_exists($productsJsonPath)) {
        echo "1. 제품 데이터 이전 중...\n";
        
        $productsJson = file_get_contents($productsJsonPath);
        $products = json_decode($productsJson, true);
        
        if ($products) {
            foreach ($products as $product) {
                // 기존 제품 확인
                $checkSql = "SELECT id FROM products WHERE sku = ?";
                $checkStmt = $db->prepare($checkSql);
                $checkStmt->execute([$product['sku']]);
                
                if (!$checkStmt->fetch()) {
                    // 제품 삽입
                    $sql = "INSERT INTO products (
                        name, slug, description, price, sku, stock_quantity, 
                        manufacturer, category_id, main_image_url, image_urls, 
                        features, is_published, is_featured, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                    
                    $stmt = $db->prepare($sql);
                    
                    // image_urls 배열을 JSON으로 변환
                    $imageUrls = isset($product['image_urls']) ? json_encode($product['image_urls']) : '[]';
                    
                    // features 객체를 JSON으로 변환  
                    $features = isset($product['features']) ? json_encode($product['features']) : '{}';
                    
                    $success = $stmt->execute([
                        $product['name'],
                        $product['slug'],
                        $product['description'],
                        $product['price'],
                        $product['sku'],
                        $product['stock_quantity'] ?? 0,
                        $product['manufacturer'] ?? 'JP Caster',
                        $product['category_id'],
                        $product['main_image_url'] ?? '',
                        $imageUrls,
                        $features,
                        isset($product['is_published']) ? $product['is_published'] : true,
                        isset($product['is_featured']) ? $product['is_featured'] : false
                    ]);
                    
                    if ($success) {
                        echo "  ✅ 제품 추가: {$product['name']}\n";
                    } else {
                        echo "  ❌ 제품 추가 실패: {$product['name']}\n";
                    }
                } else {
                    echo "  ⏭️  제품 이미 존재: {$product['name']}\n";
                }
            }
            echo "제품 데이터 이전 완료!\n\n";
        }
    } else {
        echo "제품 JSON 파일을 찾을 수 없습니다.\n\n";
    }

    // 2. 공지사항 데이터 이전
    if (file_exists($noticesJsonPath)) {
        echo "2. 공지사항 데이터 이전 중...\n";
        
        $noticesJson = file_get_contents($noticesJsonPath);
        $notices = json_decode($noticesJson, true);
        
        if ($notices) {
            foreach ($notices as $notice) {
                // 기존 공지사항 확인 (제목으로)
                $checkSql = "SELECT id FROM notices WHERE title = ?";
                $checkStmt = $db->prepare($checkSql);
                $checkStmt->execute([$notice['title']]);
                
                if (!$checkStmt->fetch()) {
                    // 공지사항 삽입
                    $sql = "INSERT INTO notices (
                        title, content, category, author, is_pinned, views, 
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
                    
                    $stmt = $db->prepare($sql);
                    
                    // 날짜 변환
                    $createdAt = isset($notice['createdAt']) ? 
                        date('Y-m-d H:i:s', strtotime($notice['createdAt'])) : 
                        date('Y-m-d H:i:s');
                    
                    $success = $stmt->execute([
                        $notice['title'],
                        $notice['content'],
                        $notice['category'] ?? '일반',
                        $notice['author'] ?? '관리자',
                        isset($notice['isPinned']) ? $notice['isPinned'] : false,
                        $notice['views'] ?? 0,
                        $createdAt
                    ]);
                    
                    if ($success) {
                        echo "  ✅ 공지사항 추가: {$notice['title']}\n";
                    } else {
                        echo "  ❌ 공지사항 추가 실패: {$notice['title']}\n";
                    }
                } else {
                    echo "  ⏭️  공지사항 이미 존재: {$notice['title']}\n";
                }
            }
            echo "공지사항 데이터 이전 완료!\n\n";
        }
    } else {
        echo "공지사항 JSON 파일을 찾을 수 없습니다.\n\n";
    }

    // 3. 통계 출력
    echo "=== 최종 통계 ===\n";
    
    $productCount = $db->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $noticeCount = $db->query("SELECT COUNT(*) FROM notices")->fetchColumn();
    $categoryCount = $db->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    
    echo "총 제품 수: {$productCount}개\n";
    echo "총 공지사항 수: {$noticeCount}개\n";
    echo "총 카테고리 수: {$categoryCount}개\n\n";
    
    echo "=== 데이터 이전 완료! ===\n";
    
} catch (Exception $e) {
    echo "❌ 오류 발생: " . $e->getMessage() . "\n";
    echo "파일: " . $e->getFile() . "\n";
    echo "라인: " . $e->getLine() . "\n";
}
?>