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

// POST 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }

    // 필수 필드 검증
    $required_fields = ['title', 'content', 'category'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 공지사항 생성
    $sql = "INSERT INTO notices (
        title, content, category, author, is_pinned, views, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())";

    $stmt = $db->prepare($sql);
    $success = $stmt->execute([
        $input['title'],
        $input['content'],
        $input['category'],
        $user['full_name'] ?: $user['email'], // 작성자명
        isset($input['is_pinned']) ? (bool)$input['is_pinned'] : false
    ]);

    if ($success) {
        $notice_id = $db->lastInsertId();
        
        // 생성된 공지사항 정보 반환
        $notice_sql = "SELECT * FROM notices WHERE id = ?";
        $notice_stmt = $db->prepare($notice_sql);
        $notice_stmt->execute([$notice_id]);
        $notice = $notice_stmt->fetch(PDO::FETCH_ASSOC);

        // Boolean 필드 변환
        $notice['is_pinned'] = (bool)$notice['is_pinned'];

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Notice created successfully',
            'notice' => $notice
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create notice']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>