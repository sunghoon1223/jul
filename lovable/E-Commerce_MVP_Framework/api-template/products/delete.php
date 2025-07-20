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

// DELETE 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

    // 제품 ID 받기
    $product_id = $_GET['id'] ?? null;
    
    if (!$product_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID is required']);
        exit;
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 제품 존재 확인
    $check_sql = "SELECT id, name FROM products WHERE id = ?";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->execute([$product_id]);
    $product = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    // 진행 중인 주문에서 사용되는지 확인
    $order_check = $db->prepare("
        SELECT COUNT(*) as count 
        FROM order_items oi 
        JOIN orders o ON oi.order_id = o.id 
        WHERE oi.product_id = ? AND o.status NOT IN ('completed', 'cancelled')
    ");
    $order_check->execute([$product_id]);
    $active_orders = $order_check->fetch(PDO::FETCH_ASSOC)['count'];

    if ($active_orders > 0) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Cannot delete product with active orders',
            'details' => "Product is used in $active_orders active order(s)"
        ]);
        exit;
    }

    // 트랜잭션 시작
    $db->beginTransaction();

    try {
        // 관련된 장바구니 아이템 삭제
        $cart_delete = $db->prepare("DELETE FROM cart_items WHERE product_id = ?");
        $cart_delete->execute([$product_id]);

        // 제품 삭제
        $product_delete = $db->prepare("DELETE FROM products WHERE id = ?");
        $success = $product_delete->execute([$product_id]);

        if ($success) {
            $db->commit();
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Product deleted successfully',
                'deleted_product' => [
                    'id' => $product_id,
                    'name' => $product['name']
                ]
            ]);
        } else {
            $db->rollback();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete product']);
        }

    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>