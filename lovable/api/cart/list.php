<?php
/**
 * 장바구니 목록 조회 API
 * GET /api/cart/list.php
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // 사용자 인증 확인 (선택사항 - 비로그인 사용자는 세션 ID 사용)
    $user = JWT::getCurrentUser();
    $session_id = $_GET['session_id'] ?? null;

    if (!$user && !$session_id) {
        errorResponse('User authentication or session ID required');
    }

    // 장바구니 아이템 조회
    $query = "SELECT ci.*, p.name, p.slug, p.price, p.main_image_url, p.stock_quantity
              FROM cart_items ci
              JOIN products p ON ci.product_id = p.id
              WHERE p.is_published = 1";

    $params = [];

    if ($user) {
        $query .= " AND ci.user_id = :user_id";
        $params[':user_id'] = $user['user_id'];
    } else {
        $query .= " AND ci.session_id = :session_id AND ci.user_id IS NULL";
        $params[':session_id'] = $session_id;
    }

    $query .= " ORDER BY ci.created_at DESC";

    $stmt = $db->prepare($query);
    foreach ($params as $param => $value) {
        $stmt->bindValue($param, $value);
    }
    $stmt->execute();

    $cart_items = $stmt->fetchAll();

    // 총합 계산
    $total_amount = 0;
    $total_items = 0;

    foreach ($cart_items as &$item) {
        $item['price'] = (float)$item['price'];
        $item['quantity'] = (int)$item['quantity'];
        $item['stock_quantity'] = (int)$item['stock_quantity'];
        
        $item['subtotal'] = $item['price'] * $item['quantity'];
        $total_amount += $item['subtotal'];
        $total_items += $item['quantity'];

        // 재고 확인
        $item['in_stock'] = $item['stock_quantity'] >= $item['quantity'];
    }

    successResponse([
        'items' => $cart_items,
        'summary' => [
            'total_items' => $total_items,
            'total_amount' => $total_amount,
            'item_count' => count($cart_items)
        ]
    ]);

} catch (Exception $e) {
    error_log("Get cart items error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>