<?php
require_once '../config/database.php';
require_once '../config/jwt.php';

// CORS 설정
setCorsHeaders();

// OPTIONS 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// PUT 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // JWT 토큰 검증
    $user = verifyJWT();
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }

    // 입력 데이터 받기
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID is required']);
        exit;
    }

    $product_id = $input['id'];

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 제품 존재 확인
    $check_sql = "SELECT id, sku FROM products WHERE id = ?";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->execute([$product_id]);
    $existing_product = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing_product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    // SKU 중복 확인 (자신을 제외하고)
    if (isset($input['sku']) && $input['sku'] !== $existing_product['sku']) {
        $sku_check = $db->prepare("SELECT id FROM products WHERE sku = ? AND id != ?");
        $sku_check->execute([$input['sku'], $product_id]);
        if ($sku_check->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'SKU already exists']);
            exit;
        }
    }

    // 카테고리 존재 확인
    if (isset($input['category_id'])) {
        $category_check = $db->prepare("SELECT id FROM categories WHERE id = ?");
        $category_check->execute([$input['category_id']]);
        if (!$category_check->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid category_id']);
            exit;
        }
    }

    // 업데이트할 필드들 준비
    $update_fields = [];
    $update_values = [];

    $allowed_fields = [
        'name', 'description', 'price', 'sku', 'stock_quantity', 
        'manufacturer', 'category_id', 'main_image_url', 'is_published'
    ];

    foreach ($allowed_fields as $field) {
        if (isset($input[$field])) {
            $update_fields[] = "$field = ?";
            
            if ($field === 'price') {
                $update_values[] = (float)$input[$field];
            } elseif ($field === 'stock_quantity') {
                $update_values[] = (int)$input[$field];
            } elseif ($field === 'is_published') {
                $update_values[] = (bool)$input[$field];
            } else {
                $update_values[] = $input[$field];
            }
        }
    }

    // image_urls와 features는 JSON으로 처리
    if (isset($input['image_urls'])) {
        $update_fields[] = "image_urls = ?";
        $update_values[] = json_encode($input['image_urls']);
    }

    if (isset($input['features'])) {
        $update_fields[] = "features = ?";
        $update_values[] = json_encode($input['features']);
    }

    if (empty($update_fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        exit;
    }

    // updated_at 추가
    $update_fields[] = "updated_at = NOW()";
    $update_values[] = $product_id;

    // 업데이트 실행
    $sql = "UPDATE products SET " . implode(', ', $update_fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $success = $stmt->execute($update_values);

    if ($success) {
        // 업데이트된 제품 정보 반환
        $product_sql = "SELECT p.*, c.name as category_name 
                       FROM products p 
                       LEFT JOIN categories c ON p.category_id = c.id 
                       WHERE p.id = ?";
        $product_stmt = $db->prepare($product_sql);
        $product_stmt->execute([$product_id]);
        $product = $product_stmt->fetch(PDO::FETCH_ASSOC);

        // JSON 필드 디코딩
        $product['image_urls'] = json_decode($product['image_urls'], true) ?: [];
        $product['features'] = json_decode($product['features'], true) ?: [];
        $product['is_published'] = (bool)$product['is_published'];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>