<?php
/**
 * 로그인 API 엔드포인트
 * POST /api/auth/login.php
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
    $password = $input['password'] ?? '';

    // 입력 검증
    if (empty($email) || empty($password)) {
        errorResponse('Email and password are required');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        errorResponse('Invalid email format');
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 사용자 조회
    $query = "SELECT id, email, password_hash, full_name, role, email_verified 
              FROM users 
              WHERE email = :email AND email_verified = 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    $user = $stmt->fetch();

    if (!$user) {
        errorResponse('Invalid email or password', 401);
    }

    // 비밀번호 검증
    if (!password_verify($password, $user['password_hash'])) {
        errorResponse('Invalid email or password', 401);
    }

    // JWT 토큰 생성
    $token_payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'full_name' => $user['full_name']
    ];

    $token = JWT::encode($token_payload);

    // 사용자 정보 (비밀번호 제외)
    $user_data = [
        'id' => $user['id'],
        'email' => $user['email'],
        'full_name' => $user['full_name'],
        'role' => $user['role']
    ];

    successResponse([
        'user' => $user_data,
        'token' => $token,
        'expires_in' => 3600
    ], 'Login successful');

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>