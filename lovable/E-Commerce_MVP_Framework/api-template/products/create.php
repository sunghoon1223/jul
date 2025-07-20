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

// POST 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }

    // 필수 필드 검증
    $required_fields = ['name', 'description', 'price', 'sku', 'stock_quantity', 'manufacturer', 'category_id'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || (is_string($input[$field]) && trim($input[$field]) === '')) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 카테고리 존재 확인
    $category_check = $db->prepare("SELECT id FROM categories WHERE id = ?");
    $category_check->execute([$input['category_id']]);
    if (!$category_check->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid category_id']);
        exit;
    }

    // SKU 중복 확인
    $sku_check = $db->prepare("SELECT id FROM products WHERE sku = ?");
    $sku_check->execute([$input['sku']]);
    if ($sku_check->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'SKU already exists']);
        exit;
    }

    // 제품 생성
    $sql = "INSERT INTO products (
        name, description, price, sku, stock_quantity, manufacturer, 
        category_id, main_image_url, image_urls, features, is_published, 
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

    $stmt = $db->prepare($sql);
    $success = $stmt->execute([
        $input['name'],
        $input['description'],
        (float)$input['price'],
        $input['sku'],
        (int)$input['stock_quantity'],
        $input['manufacturer'],
        $input['category_id'],
        $input['main_image_url'] ?? '',
        json_encode($input['image_urls'] ?? []),
        json_encode($input['features'] ?? []),
        isset($input['is_published']) ? (bool)$input['is_published'] : true
    ]);

    if ($success) {
        $product_id = $db->lastInsertId();
        
        // 생성된 제품 정보 반환
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

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Product created successfully',
            'product' => $product
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create product']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>