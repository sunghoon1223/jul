<?php
/**
 * 제품 목록 조회 API
 * GET /api/products/list.php
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // URL 파라미터 받기
    $category_id = $_GET['category_id'] ?? null;
    $category_slug = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $featured = $_GET['featured'] ?? null;
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = (int)($_GET['offset'] ?? 0);

    // 기본 쿼리
    $query = "SELECT p.*, c.name as category_name, c.slug as category_slug 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              WHERE p.is_published = 1";

    $params = [];

    // 카테고리 필터
    if ($category_id) {
        $query .= " AND p.category_id = :category_id";
        $params[':category_id'] = $category_id;
    }

    if ($category_slug) {
        $query .= " AND c.slug = :category_slug";
        $params[':category_slug'] = $category_slug;
    }

    // 검색 필터
    if ($search) {
        $query .= " AND (p.name LIKE :search OR p.description LIKE :search OR p.sku LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    // 추천 제품 필터
    if ($featured === 'true') {
        $query .= " AND p.is_featured = 1";
    }

    // 정렬
    $query .= " ORDER BY p.is_featured DESC, p.created_at DESC";

    // 페이지네이션
    $query .= " LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($query);

    // 파라미터 바인딩
    foreach ($params as $param => $value) {
        $stmt->bindValue($param, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $products = $stmt->fetchAll();

    // 총 개수 조회
    $count_query = str_replace("SELECT p.*, c.name as category_name, c.slug as category_slug", "SELECT COUNT(*)", $query);
    $count_query = preg_replace('/ORDER BY.*$/i', '', $count_query);
    $count_query = preg_replace('/LIMIT.*$/i', '', $count_query);

    $count_stmt = $db->prepare($count_query);
    foreach ($params as $param => $value) {
        $count_stmt->bindValue($param, $value);
    }
    $count_stmt->execute();
    $total_count = $count_stmt->fetchColumn();

    // 이미지 URL과 특성 JSON 파싱
    foreach ($products as &$product) {
        if ($product['image_urls']) {
            $product['image_urls'] = json_decode($product['image_urls'], true);
        }
        if ($product['features']) {
            $product['features'] = json_decode($product['features'], true);
        }
        
        // 가격 포맷팅
        $product['price'] = (float)$product['price'];
        $product['stock_quantity'] = (int)$product['stock_quantity'];
        $product['is_featured'] = (bool)$product['is_featured'];
        $product['is_published'] = (bool)$product['is_published'];
    }

    successResponse([
        'products' => $products,
        'pagination' => [
            'total' => (int)$total_count,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $total_count
        ]
    ]);

} catch (Exception $e) {
    error_log("Get products error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>