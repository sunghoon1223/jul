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

    // 검색 파라미터
    $search = $_GET['search'] ?? '';
    $role_filter = $_GET['role'] ?? '';

    // 기본 쿼리
    $where_conditions = [];
    $params = [];

    // 검색 조건 추가
    if (!empty($search)) {
        $where_conditions[] = "(full_name LIKE ? OR email LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    // 역할 필터
    if (!empty($role_filter)) {
        $where_conditions[] = "role = ?";
        $params[] = $role_filter;
    }

    $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

    // 총 사용자 수 조회
    $count_sql = "SELECT COUNT(*) as total FROM users $where_clause";
    $count_stmt = $db->prepare($count_sql);
    $count_stmt->execute($params);
    $total_users = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 사용자 목록 조회 (비밀번호 제외)
    $sql = "SELECT 
                id, email, full_name, phone, role, email_verified, 
                created_at, updated_at, last_login_at
            FROM users 
            $where_clause 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge($params, [$limit, $offset]));
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Boolean 필드 변환
    foreach ($users as &$user_item) {
        $user_item['email_verified'] = (bool)$user_item['email_verified'];
        
        // 마지막 로그인 시간 포맷팅
        if ($user_item['last_login_at']) {
            $user_item['last_login_formatted'] = date('Y-m-d H:i', strtotime($user_item['last_login_at']));
        } else {
            $user_item['last_login_formatted'] = '로그인 기록 없음';
        }

        // 가입일 포맷팅
        $user_item['created_at_formatted'] = date('Y-m-d', strtotime($user_item['created_at']));
    }

    // 페이지네이션 정보
    $total_pages = ceil($total_users / $limit);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'users' => $users,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages,
            'total_users' => $total_users,
            'per_page' => $limit,
            'has_next' => $page < $total_pages,
            'has_prev' => $page > 1
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>