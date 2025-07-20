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
    
    if (!$input || !isset($input['id']) || !isset($input['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID and status are required']);
        exit;
    }

    $order_id = $input['id'];
    $new_status = $input['status'];

    // 허용된 상태 확인
    $allowed_statuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!in_array($new_status, $allowed_statuses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status value']);
        exit;
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 주문 존재 확인
    $check_sql = "SELECT id, status, user_id FROM orders WHERE id = ?";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->execute([$order_id]);
    $order = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit;
    }

    // 상태 변경 가능 여부 확인
    $current_status = $order['status'];
    
    // 완료되거나 취소된 주문은 상태 변경 불가
    if (in_array($current_status, ['completed', 'cancelled'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Cannot change status of completed or cancelled orders']);
        exit;
    }

    // 트랜잭션 시작
    $db->beginTransaction();

    try {
        // 주문 상태 업데이트
        $update_sql = "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?";
        $update_stmt = $db->prepare($update_sql);
        $success = $update_stmt->execute([$new_status, $order_id]);

        if (!$success) {
            throw new Exception('Failed to update order status');
        }

        // 재고 처리 (취소 시 재고 복원)
        if ($new_status === 'cancelled' && $current_status !== 'cancelled') {
            // 주문 아이템들의 재고 복원
            $items_sql = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
            $items_stmt = $db->prepare($items_sql);
            $items_stmt->execute([$order_id]);
            $items = $items_stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as $item) {
                $restore_sql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";
                $restore_stmt = $db->prepare($restore_sql);
                $restore_stmt->execute([$item['quantity'], $item['product_id']]);
            }
        }

        $db->commit();

        // 업데이트된 주문 정보 반환
        $order_sql = "SELECT 
                        o.*, u.full_name as customer_name, u.email as customer_email
                      FROM orders o
                      LEFT JOIN users u ON o.user_id = u.id
                      WHERE o.id = ?";
        $order_stmt = $db->prepare($order_sql);
        $order_stmt->execute([$order_id]);
        $updated_order = $order_stmt->fetch(PDO::FETCH_ASSOC);

        // 상태별 한글 표시
        $status_text = [
            'pending' => '대기중',
            'processing' => '처리중',
            'shipped' => '배송중',
            'delivered' => '배송완료',
            'completed' => '완료',
            'cancelled' => '취소됨'
        ];
        $updated_order['status_text'] = $status_text[$new_status];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Order status updated successfully',
            'order' => $updated_order
        ]);

    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>