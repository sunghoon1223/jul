<?php
/**
 * 장바구니 아이템 추가 API
 * POST /api/cart/add.php
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

try {
    // JSON 입력 받기
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        errorResponse('Invalid JSON input');
    }

    $product_id = $input['product_id'] ?? null;
    $quantity = (int)($input['quantity'] ?? 1);
    $session_id = $input['session_id'] ?? null;

    // 입력 검증
    if (!$product_id) {
        errorResponse('Product ID is required');
    }

    if ($quantity <= 0) {
        errorResponse('Quantity must be greater than 0');
    }

    $database = new Database();
    $db = $database->getConnection();

    // 제품 존재 및 재고 확인
    $product_query = "SELECT id, name, price, stock_quantity, is_published 
                      FROM products 
                      WHERE id = :product_id";
    
    $product_stmt = $db->prepare($product_query);
    $product_stmt->bindParam(':product_id', $product_id);
    $product_stmt->execute();
    $product = $product_stmt->fetch();

    if (!$product || !$product['is_published']) {
        errorResponse('Product not found or not available', 404);
    }

    if ($product['stock_quantity'] < $quantity) {
        errorResponse('Insufficient stock. Available: ' . $product['stock_quantity'], 400);
    }

    // 사용자 인증 확인 (선택사항)
    $user = JWT::getCurrentUser();
    
    if (!$user && !$session_id) {
        errorResponse('User authentication or session ID required');
    }

    // 기존 장바구니 아이템 확인
    $check_query = "SELECT id, quantity FROM cart_items WHERE product_id = :product_id";
    $check_params = [':product_id' => $product_id];

    if ($user) {
        $check_query .= " AND user_id = :user_id";
        $check_params[':user_id'] = $user['user_id'];
    } else {
        $check_query .= " AND session_id = :session_id AND user_id IS NULL";
        $check_params[':session_id'] = $session_id;
    }

    $check_stmt = $db->prepare($check_query);
    foreach ($check_params as $param => $value) {
        $check_stmt->bindValue($param, $value);
    }
    $check_stmt->execute();
    $existing_item = $check_stmt->fetch();

    if ($existing_item) {
        // 기존 아이템 수량 업데이트
        $new_quantity = $existing_item['quantity'] + $quantity;
        
        if ($product['stock_quantity'] < $new_quantity) {
            errorResponse('Total quantity exceeds stock. Available: ' . $product['stock_quantity'], 400);
        }

        $update_query = "UPDATE cart_items SET quantity = :quantity, updated_at = CURRENT_TIMESTAMP 
                         WHERE id = :item_id";
        
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':quantity', $new_quantity);
        $update_stmt->bindParam(':item_id', $existing_item['id']);
        $update_stmt->execute();

        $item_id = $existing_item['id'];
    } else {
        // 새 아이템 추가
        $insert_query = "INSERT INTO cart_items (user_id, session_id, product_id, quantity) 
                         VALUES (:user_id, :session_id, :product_id, :quantity)";
        
        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->bindParam(':user_id', $user ? $user['user_id'] : null);
        $insert_stmt->bindParam(':session_id', $user ? null : $session_id);
        $insert_stmt->bindParam(':product_id', $product_id);
        $insert_stmt->bindParam(':quantity', $quantity);
        $insert_stmt->execute();

        $item_id = $db->lastInsertId();
    }

    // 추가된 아이템 정보 조회
    $item_query = "SELECT ci.*, p.name, p.price, p.main_image_url
                   FROM cart_items ci
                   JOIN products p ON ci.product_id = p.id
                   WHERE ci.id = :item_id";
    
    $item_stmt = $db->prepare($item_query);
    $item_stmt->bindParam(':item_id', $item_id);
    $item_stmt->execute();
    $item = $item_stmt->fetch();

    // 타입 변환
    $item['price'] = (float)$item['price'];
    $item['quantity'] = (int)$item['quantity'];
    $item['subtotal'] = $item['price'] * $item['quantity'];

    successResponse($item, 'Item added to cart successfully');

} catch (Exception $e) {
    error_log("Add to cart error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>