<?php
/**
 * 현재 사용자 정보 조회 API
 * GET /api/auth/me.php
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

try {
    // JWT 토큰 검증
    $user = JWT::requireAuth();

    // 데이터베이스에서 최신 사용자 정보 조회
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, email, full_name, phone, address, role, created_at 
              FROM users 
              WHERE id = :user_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['user_id']);
    $stmt->execute();

    $user_data = $stmt->fetch();

    if (!$user_data) {
        errorResponse('User not found', 404);
    }

    successResponse($user_data, 'User information retrieved');

} catch (Exception $e) {
    error_log("Get user info error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>