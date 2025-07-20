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
    // 데이터베이스 연결
    $database = new Database();
    $db = $database->getConnection();

    // 페이지네이션 파라미터
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    // 필터 파라미터
    $category_filter = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';

    // 기본 쿼리
    $where_conditions = [];
    $params = [];

    // 카테고리 필터
    if (!empty($category_filter)) {
        $where_conditions[] = "category = ?";
        $params[] = $category_filter;
    }

    // 검색 조건
    if (!empty($search)) {
        $where_conditions[] = "(title LIKE ? OR content LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

    // 총 공지사항 수 조회
    $count_sql = "SELECT COUNT(*) as total FROM notices $where_clause";
    $count_stmt = $db->prepare($count_sql);
    $count_stmt->execute($params);
    $total_notices = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 공지사항 목록 조회 (고정된 것 먼저, 최신순)
    $sql = "SELECT * FROM notices 
            $where_clause 
            ORDER BY is_pinned DESC, created_at DESC 
            LIMIT ? OFFSET ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge($params, [$limit, $offset]));
    $notices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Boolean 필드 변환 및 데이터 보강
    foreach ($notices as &$notice) {
        $notice['is_pinned'] = (bool)$notice['is_pinned'];
        $notice['isPinned'] = $notice['is_pinned']; // Frontend 호환성
        
        // 날짜 포맷팅
        $notice['created_at_formatted'] = date('Y-m-d', strtotime($notice['created_at']));
        $notice['createdAt'] = $notice['created_at']; // Frontend 호환성
        
        // 미리보기 텍스트 (100자 제한)
        $notice['preview'] = mb_substr(strip_tags($notice['content']), 0, 100) . 
                            (mb_strlen($notice['content']) > 100 ? '...' : '');
    }

    // 페이지네이션 정보
    $total_pages = ceil($total_notices / $limit);

    // 카테고리별 통계
    $category_stats_sql = "SELECT category, COUNT(*) as count FROM notices GROUP BY category";
    $category_stats_stmt = $db->prepare($category_stats_sql);
    $category_stats_stmt->execute();
    $category_stats = $category_stats_stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'notices' => $notices,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $total_pages,
            'total_notices' => $total_notices,
            'per_page' => $limit,
            'has_next' => $page < $total_pages,
            'has_prev' => $page > 1
        ],
        'category_statistics' => $category_stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>