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
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Notice ID is required']);
        exit;
    }

    $notice_id = $input['id'];

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 현재 공지사항 상태 확인
    $check_sql = "SELECT id, title, is_pinned FROM notices WHERE id = ?";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->execute([$notice_id]);
    $notice = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$notice) {
        http_response_code(404);
        echo json_encode(['error' => 'Notice not found']);
        exit;
    }

    // 고정 상태 토글
    $new_status = !$notice['is_pinned'];
    
    $update_sql = "UPDATE notices SET is_pinned = ?, updated_at = NOW() WHERE id = ?";
    $update_stmt = $db->prepare($update_sql);
    $success = $update_stmt->execute([$new_status, $notice_id]);

    if ($success) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Notice pin status updated successfully',
            'notice' => [
                'id' => $notice_id,
                'title' => $notice['title'],
                'is_pinned' => $new_status,
                'status_text' => $new_status ? '고정됨' : '일반'
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update notice status']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>