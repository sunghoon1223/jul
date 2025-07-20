<?php
/**
 * 주문 생성 API
 * POST /api/orders/create.php
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

    $email = trim($input['email'] ?? '');
    $full_name = trim($input['full_name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');
    $payment_method = $input['payment_method'] ?? 'credit_card';
    $shipping_method = $input['shipping_method'] ?? 'standard';
    $items = $input['items'] ?? [];
    $session_id = $input['session_id'] ?? null;

    // 입력 검증
    if (empty($email) || empty($full_name) || empty($phone) || empty($address)) {
        errorResponse('All contact information is required');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        errorResponse('Invalid email format');
    }

    if (empty($items)) {
        errorResponse('Order items are required');
    }

    $database = new Database();
    $db = $database->getConnection();

    // 트랜잭션 시작
    $db->beginTransaction();

    try {
        // 사용자 정보 (로그인한 경우)
        $user = JWT::getCurrentUser();
        $user_id = $user ? $user['user_id'] : null;

        // 주문 아이템 검증 및 총액 계산
        $total_amount = 0;
        $validated_items = [];

        foreach ($items as $item) {
            $product_id = $item['product_id'] ?? null;
            $quantity = (int)($item['quantity'] ?? 0);

            if (!$product_id || $quantity <= 0) {
                throw new Exception('Invalid item data');
            }

            // 제품 정보 및 재고 확인
            $product_query = "SELECT id, name, price, stock_quantity, is_published 
                              FROM products 
                              WHERE id = :product_id AND is_published = 1";
            
            $product_stmt = $db->prepare($product_query);
            $product_stmt->bindParam(':product_id', $product_id);
            $product_stmt->execute();
            $product = $product_stmt->fetch();

            if (!$product) {
                throw new Exception('Product not found: ' . $product_id);
            }

            if ($product['stock_quantity'] < $quantity) {
                throw new Exception('Insufficient stock for: ' . $product['name']);
            }

            $item_total = $product['price'] * $quantity;
            $total_amount += $item_total;

            $validated_items[] = [
                'product_id' => $product['id'],
                'product_name' => $product['name'],
                'product_price' => $product['price'],
                'quantity' => $quantity,
                'total_price' => $item_total
            ];
        }

        // 주문 생성
        $order_query = "INSERT INTO orders (user_id, email, full_name, phone, address, total_amount, payment_method, shipping_method) 
                        VALUES (:user_id, :email, :full_name, :phone, :address, :total_amount, :payment_method, :shipping_method)";
        
        $order_stmt = $db->prepare($order_query);
        $order_stmt->bindParam(':user_id', $user_id);
        $order_stmt->bindParam(':email', $email);
        $order_stmt->bindParam(':full_name', $full_name);
        $order_stmt->bindParam(':phone', $phone);
        $order_stmt->bindParam(':address', $address);
        $order_stmt->bindParam(':total_amount', $total_amount);
        $order_stmt->bindParam(':payment_method', $payment_method);
        $order_stmt->bindParam(':shipping_method', $shipping_method);
        $order_stmt->execute();

        $order_id = $db->lastInsertId();

        // 주문 아이템 생성 및 재고 차감
        foreach ($validated_items as $item) {
            // 주문 아이템 추가
            $item_query = "INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, total_price) 
                           VALUES (:order_id, :product_id, :product_name, :product_price, :quantity, :total_price)";
            
            $item_stmt = $db->prepare($item_query);
            $item_stmt->bindParam(':order_id', $order_id);
            $item_stmt->bindParam(':product_id', $item['product_id']);
            $item_stmt->bindParam(':product_name', $item['product_name']);
            $item_stmt->bindParam(':product_price', $item['product_price']);
            $item_stmt->bindParam(':quantity', $item['quantity']);
            $item_stmt->bindParam(':total_price', $item['total_price']);
            $item_stmt->execute();

            // 재고 차감
            $stock_query = "UPDATE products SET stock_quantity = stock_quantity - :quantity 
                            WHERE id = :product_id";
            
            $stock_stmt = $db->prepare($stock_query);
            $stock_stmt->bindParam(':quantity', $item['quantity']);
            $stock_stmt->bindParam(':product_id', $item['product_id']);
            $stock_stmt->execute();
        }

        // 장바구니에서 주문한 아이템 제거
        if ($user_id) {
            $clear_cart_query = "DELETE FROM cart_items WHERE user_id = :user_id";
            $clear_stmt = $db->prepare($clear_cart_query);
            $clear_stmt->bindParam(':user_id', $user_id);
            $clear_stmt->execute();
        } elseif ($session_id) {
            $clear_cart_query = "DELETE FROM cart_items WHERE session_id = :session_id";
            $clear_stmt = $db->prepare($clear_cart_query);
            $clear_stmt->bindParam(':session_id', $session_id);
            $clear_stmt->execute();
        }

        // 트랜잭션 커밋
        $db->commit();

        // 생성된 주문 정보 조회
        $order_detail_query = "SELECT * FROM orders WHERE id = :order_id";
        $order_detail_stmt = $db->prepare($order_detail_query);
        $order_detail_stmt->bindParam(':order_id', $order_id);
        $order_detail_stmt->execute();
        $order = $order_detail_stmt->fetch();

        // 주문 아이템 조회
        $items_query = "SELECT * FROM order_items WHERE order_id = :order_id";
        $items_stmt = $db->prepare($items_query);
        $items_stmt->bindParam(':order_id', $order_id);
        $items_stmt->execute();
        $order_items = $items_stmt->fetchAll();

        // 타입 변환
        $order['total_amount'] = (float)$order['total_amount'];
        foreach ($order_items as &$item) {
            $item['product_price'] = (float)$item['product_price'];
            $item['quantity'] = (int)$item['quantity'];
            $item['total_price'] = (float)$item['total_price'];
        }

        successResponse([
            'order' => $order,
            'items' => $order_items
        ], 'Order created successfully');

    } catch (Exception $e) {
        // 트랜잭션 롤백
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Create order error: " . $e->getMessage());
    errorResponse($e->getMessage(), 500);
}
?>