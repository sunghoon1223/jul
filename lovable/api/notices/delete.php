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

// DELETE 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

    // 공지사항 ID 받기
    $notice_id = $_GET['id'] ?? null;
    
    if (!$notice_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Notice ID is required']);
        exit;
    }

    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 공지사항 존재 확인
    $check_sql = "SELECT id, title FROM notices WHERE id = ?";
    $check_stmt = $db->prepare($check_sql);
    $check_stmt->execute([$notice_id]);
    $notice = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$notice) {
        http_response_code(404);
        echo json_encode(['error' => 'Notice not found']);
        exit;
    }

    // 공지사항 삭제
    $delete_sql = "DELETE FROM notices WHERE id = ?";
    $delete_stmt = $db->prepare($delete_sql);
    $success = $delete_stmt->execute([$notice_id]);

    if ($success) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Notice deleted successfully',
            'deleted_notice' => [
                'id' => $notice_id,
                'title' => $notice['title']
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete notice']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>