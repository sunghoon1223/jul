<?php
/**
 * 카테고리 목록 조회 API
 * GET /api/categories/list.php
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

    // 카테고리별 제품 수 포함하여 조회
    $query = "SELECT c.*, COUNT(p.id) as product_count
              FROM categories c
              LEFT JOIN products p ON c.id = p.category_id AND p.is_published = 1
              WHERE c.is_active = 1
              GROUP BY c.id
              ORDER BY c.sort_order ASC, c.name ASC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $categories = $stmt->fetchAll();

    // 타입 변환
    foreach ($categories as &$category) {
        $category['product_count'] = (int)$category['product_count'];
        $category['sort_order'] = (int)$category['sort_order'];
        $category['is_active'] = (bool)$category['is_active'];
    }

    successResponse($categories);

} catch (Exception $e) {
    error_log("Get categories error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>