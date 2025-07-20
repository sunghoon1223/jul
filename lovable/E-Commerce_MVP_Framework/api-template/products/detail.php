<?php
/**
 * 제품 상세 정보 조회 API
 * GET /api/products/detail.php?slug=product-slug
 * GET /api/products/detail.php?id=product-id
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

    $product_id = $_GET['id'] ?? null;
    $product_slug = $_GET['slug'] ?? null;

    if (!$product_id && !$product_slug) {
        errorResponse('Product ID or slug is required');
    }

    // 제품 상세 정보 조회
    $query = "SELECT p.*, c.name as category_name, c.slug as category_slug 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              WHERE p.is_published = 1";

    if ($product_id) {
        $query .= " AND p.id = :product_id";
    } else {
        $query .= " AND p.slug = :product_slug";
    }

    $stmt = $db->prepare($query);
    
    if ($product_id) {
        $stmt->bindParam(':product_id', $product_id);
    } else {
        $stmt->bindParam(':product_slug', $product_slug);
    }

    $stmt->execute();
    $product = $stmt->fetch();

    if (!$product) {
        errorResponse('Product not found', 404);
    }

    // JSON 필드 파싱
    if ($product['image_urls']) {
        $product['image_urls'] = json_decode($product['image_urls'], true);
    }
    if ($product['features']) {
        $product['features'] = json_decode($product['features'], true);
    }

    // 타입 변환
    $product['price'] = (float)$product['price'];
    $product['stock_quantity'] = (int)$product['stock_quantity'];
    $product['is_featured'] = (bool)$product['is_featured'];
    $product['is_published'] = (bool)$product['is_published'];

    // 관련 제품 조회 (같은 카테고리의 다른 제품들)
    $related_query = "SELECT id, name, slug, price, main_image_url, is_featured 
                      FROM products 
                      WHERE category_id = :category_id 
                      AND id != :current_id 
                      AND is_published = 1 
                      ORDER BY is_featured DESC, RAND() 
                      LIMIT 4";

    $related_stmt = $db->prepare($related_query);
    $related_stmt->bindParam(':category_id', $product['category_id']);
    $related_stmt->bindParam(':current_id', $product['id']);
    $related_stmt->execute();
    $related_products = $related_stmt->fetchAll();

    // 관련 제품 타입 변환
    foreach ($related_products as &$related) {
        $related['price'] = (float)$related['price'];
        $related['is_featured'] = (bool)$related['is_featured'];
    }

    successResponse([
        'product' => $product,
        'related_products' => $related_products
    ]);

} catch (Exception $e) {
    error_log("Get product detail error: " . $e->getMessage());
    errorResponse('Internal server error', 500);
}
?>