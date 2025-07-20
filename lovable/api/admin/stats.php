<?php
require_once '../config/database.php';
require_once '../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // JWT 토큰 검증
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        throw new Exception('Authorization header missing');
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $payload = validateJWT($token);
    
    if (!$payload || !$payload['is_admin']) {
        throw new Exception('Admin access required');
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // 현재 날짜 기준으로 월 계산
        $currentMonth = date('Y-m');
        $startOfMonth = $currentMonth . '-01';
        $endOfMonth = date('Y-m-t'); // 해당 월의 마지막 날

        // 총 제품 수
        $productStmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE deleted_at IS NULL");
        $productStmt->execute();
        $totalProducts = $productStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 총 사용자 수
        $userStmt = $db->prepare("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL");
        $userStmt->execute();
        $totalUsers = $userStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 이번 달 주문 수
        $monthlyOrderStmt = $db->prepare("
            SELECT COUNT(*) as total 
            FROM orders 
            WHERE DATE(created_at) >= ? 
            AND DATE(created_at) <= ?
            AND deleted_at IS NULL
        ");
        $monthlyOrderStmt->execute([$startOfMonth, $endOfMonth]);
        $monthlyOrders = $monthlyOrderStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 이번 달 매출
        $monthlyRevenueStmt = $db->prepare("
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM orders 
            WHERE DATE(created_at) >= ? 
            AND DATE(created_at) <= ?
            AND status IN ('completed', 'processing')
            AND deleted_at IS NULL
        ");
        $monthlyRevenueStmt->execute([$startOfMonth, $endOfMonth]);
        $monthlyRevenue = $monthlyRevenueStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 추가 통계 (선택사항)
        // 활성 제품 수
        $activeProductsStmt = $db->prepare("SELECT COUNT(*) as total FROM products WHERE is_published = 1 AND deleted_at IS NULL");
        $activeProductsStmt->execute();
        $activeProducts = $activeProductsStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 이번 주 신규 사용자
        $weekStart = date('Y-m-d', strtotime('monday this week'));
        $weekEnd = date('Y-m-d', strtotime('sunday this week'));
        
        $weeklyUsersStmt = $db->prepare("
            SELECT COUNT(*) as total 
            FROM users 
            WHERE DATE(created_at) >= ? 
            AND DATE(created_at) <= ?
            AND deleted_at IS NULL
        ");
        $weeklyUsersStmt->execute([$weekStart, $weekEnd]);
        $weeklyNewUsers = $weeklyUsersStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 평균 주문 금액
        $avgOrderStmt = $db->prepare("
            SELECT COALESCE(AVG(total_amount), 0) as average 
            FROM orders 
            WHERE DATE(created_at) >= ? 
            AND DATE(created_at) <= ?
            AND status IN ('completed', 'processing')
            AND deleted_at IS NULL
        ");
        $avgOrderStmt->execute([$startOfMonth, $endOfMonth]);
        $avgOrderAmount = $avgOrderStmt->fetch(PDO::FETCH_ASSOC)['average'];

        echo json_encode([
            'success' => true,
            'totalProducts' => (int)$totalProducts,
            'totalUsers' => (int)$totalUsers,
            'monthlyOrders' => (int)$monthlyOrders,
            'monthlyRevenue' => (float)$monthlyRevenue,
            'additional' => [
                'activeProducts' => (int)$activeProducts,
                'weeklyNewUsers' => (int)$weeklyNewUsers,
                'avgOrderAmount' => (float)$avgOrderAmount,
                'month' => $currentMonth
            ]
        ]);

    } else {
        throw new Exception('Method not allowed');
    }

} catch (Exception $e) {
    error_log("Stats API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>