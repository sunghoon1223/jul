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
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID is required']);
        exit;
    }

    $product_id = $input['id'];

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 현재 제품 상태 확인
    $check_sql = "SELECT id, name, is_published FROM products WHERE id = ?";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->execute([$product_id]);
    $product = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    // 발행 상태 토글
    $new_status = !$product['is_published'];
    
    $update_sql = "UPDATE products SET is_published = ?, updated_at = NOW() WHERE id = ?";
    $update_stmt = $db->prepare($update_sql);
    $success = $update_stmt->execute([$new_status, $product_id]);

    if ($success) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Product publish status updated successfully',
            'product' => [
                'id' => $product_id,
                'name' => $product['name'],
                'is_published' => $new_status,
                'status_text' => $new_status ? '발행됨' : '초안'
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product status']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>