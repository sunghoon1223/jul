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
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Notice ID is required']);
        exit;
    }

    $notice_id = $input['id'];

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 공지사항 존재 확인
    $check_sql = "SELECT id FROM notices WHERE id = ?";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->execute([$notice_id]);

    if (!$check_stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Notice not found']);
        exit;
    }

    // 업데이트할 필드들 준비
    $update_fields = [];
    $update_values = [];

    $allowed_fields = ['title', 'content', 'category', 'is_pinned'];

    foreach ($allowed_fields as $field) {
        if (isset($input[$field])) {
            $update_fields[] = "$field = ?";
            
            if ($field === 'is_pinned') {
                $update_values[] = (bool)$input[$field];
            } else {
                $update_values[] = $input[$field];
            }
        }
    }

    if (empty($update_fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        exit;
    }

    // updated_at 추가
    $update_fields[] = "updated_at = NOW()";
    $update_values[] = $notice_id;

    // 업데이트 실행
    $sql = "UPDATE notices SET " . implode(', ', $update_fields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $success = $stmt->execute($update_values);

    if ($success) {
        // 업데이트된 공지사항 정보 반환
        $notice_sql = "SELECT * FROM notices WHERE id = ?";
        $notice_stmt = $db->prepare($notice_sql);
        $notice_stmt->execute([$notice_id]);
        $notice = $notice_stmt->fetch(PDO::FETCH_ASSOC);

        // Boolean 필드 변환
        $notice['is_pinned'] = (bool)$notice['is_pinned'];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Notice updated successfully',
            'notice' => $notice
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update notice']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>