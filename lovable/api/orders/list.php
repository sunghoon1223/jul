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

// GET 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 페이지네이션 파라미터
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // 필터 파라미터
    $status_filter = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';

    // 기본 쿼리
    $where_conditions = [];
    $params = [];

    // 상태 필터
    if (!empty($status_filter)) {
        $where_conditions[] = "o.status = ?";
        $params[] = $status_filter;
    }

    // 검색 조건 (고객명 또는 이메일)
    if (!empty($search)) {
        $where_conditions[] = "(u.full_name LIKE ? OR u.email LIKE ? OR o.id LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

    // 총 주문 수 조회
    $count_sql = "SELECT COUNT(*) as total 
                  FROM orders o 
                  LEFT JOIN users u ON o.user_id = u.id 
                  $where_clause";
    $count_stmt = $db->prepare($count_sql);
    $count_stmt->execute($params);
    $total_orders = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 주문 목록 조회
    $sql = "SELECT 
                o.id, o.total_amount, o.status, o.created_at, o.updated_at,
                o.shipping_address, o.payment_method, o.payment_status,
                u.full_name as customer_name, u.email as customer_email,
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            $where_clause
            GROUP BY o.id
            ORDER BY o.created_at DESC 
            LIMIT ? OFFSET ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge($params, [$limit, $offset]));
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 각 주문의 상세 정보 보강
    foreach ($orders as &$order) {
        // 주문 아이템 조회
        $items_sql = "SELECT 
                        oi.*, p.name as product_name, p.sku
                      FROM order_items oi
                      LEFT JOIN products p ON oi.product_id = p.id
                      WHERE oi.order_id = ?";
        $items_stmt = $db->prepare($items_sql);
        $items_stmt->execute([$order['id']]);
        $order['items'] = $items_stmt->fetchAll(PDO::FETCH_ASSOC);

        // 날짜 포맷팅
        $order['created_at_formatted'] = date('Y-m-d H:i', strtotime($order['created_at']));
        $order['order_date'] = date('Y-m-d', strtotime($order['created_at']));
        
        // 주문 상태별 한글 표시
        $status_text = [
            'pending' => '대기중',
            'processing' => '처리중',
            'shipped' => '배송중',
            'delivered' => '배송완료',
            'completed' => '완료',
            'cancelled' => '취소됨'
        ];
        $order['status_text'] = $status_text[$order['status']] ?? $order['status'];

        // 결제 상태별 한글 표시
        $payment_status_text = [
            'pending' => '결제대기',
            'paid' => '결제완료',
            'failed' => '결제실패',
            'refunded' => '환불됨'
        ];
        $order['payment_status_text'] = $payment_status_text[$order['payment_status']] ?? $order['payment_status'];
    }

    // 페이지네이션 정보
    $total_pages = ceil($total_orders / $limit);

    // 상태별 주문 수 통계
    $stats_sql = "SELECT 
                    status, 
                    COUNT(*) as count,
                    SUM(total_amount) as total_amount
                  FROM orders 
                  GROUP BY status";
    $stats_stmt = $db->prepare($stats_sql);
    $stats_stmt->execute();
    $status_stats = $stats_stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages,
            'total_orders' => $total_orders,
            'per_page' => $limit,
            'has_next' => $page < $total_pages,
            'has_prev' => $page > 1
        ],
        'statistics' => $status_stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>