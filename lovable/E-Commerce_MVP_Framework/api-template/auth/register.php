<?php
/**
 * 회원가입 API 엔드포인트
 * POST /api/auth/register.php
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
    $full_name = trim($input['full_name'] ?? '');
    $phone = trim($input['phone'] ?? '');

    // 입력 검증
    if (empty($email) || empty($password) || empty($full_name)) {
        errorResponse('Email, password, and full name are required');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        errorResponse('Invalid email format');
    }

    if (strlen($password) < 6) {
        errorResponse('Password must be at least 6 characters long');
    }

    if (strlen($full_name) < 2) {
        errorResponse('Full name must be at least 2 characters long');
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 이메일 중복 확인
    $check_query = "SELECT id FROM users WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();

    if ($check_stmt->fetch()) {
        errorResponse('Email already exists', 409);
    }

    // 비밀번호 해시
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // 사용자 생성
    $insert_query = "INSERT INTO users (email, password_hash, full_name, phone, email_verified) 
                     VALUES (:email, :password_hash, :full_name, :phone, :email_verified)";
    
    $insert_stmt = $db->prepare($insert_query);
    $insert_stmt->bindParam(':email', $email);
    $insert_stmt->bindParam(':password_hash', $password_hash);
    $insert_stmt->bindParam(':full_name', $full_name);
    $insert_stmt->bindParam(':phone', $phone);
    
    // 개발환경에서는 자동 이메일 인증, 프로덕션에서는 이메일 인증 필요
    $email_verified = true; // 개발용
    $insert_stmt->bindParam(':email_verified', $email_verified);

    if (!$insert_stmt->execute()) {
        errorResponse('Failed to create user', 500);
    }

    // 생성된 사용자 ID 가져오기
    $user_id = $db->lastInsertId();

    // 생성된 사용자 정보 조회
    $user_query = "SELECT id, email, full_name, role FROM users WHERE id = :user_id";
    $user_stmt = $db->prepare($user_query);
    $user_stmt->bindParam(':user_id', $user_id);
    $user_stmt->execute();
    $user = $user_stmt->fetch();

    // JWT 토큰 생성
    $token_payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'full_name' => $user['full_name']
    ];

    $token = JWT::encode($token_payload);

    // 응답 데이터
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
    ], 'Registration successful');

} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>