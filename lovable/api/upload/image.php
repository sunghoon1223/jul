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
    // JWT 토큰 검증 (인증된 사용자만)
    $user = verifyJWT();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    // 파일 업로드 확인
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid image file uploaded']);
        exit;
    }

    $file = $_FILES['image'];
    
    // 파일 크기 제한 (5MB)
    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(['error' => 'File size too large. Maximum 5MB allowed.']);
        exit;
    }

    // 허용된 파일 타입 확인
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime_type, $allowed_types)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.']);
        exit;
    }

    // 파일 확장자 확인
    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($file_extension, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file extension.']);
        exit;
    }

    // 업로드 디렉토리 설정
    $upload_dir = '../../public/images/uploads/';
    
    // 디렉토리가 없으면 생성
    if (!is_dir($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create upload directory']);
            exit;
        }
    }

    // 고유한 파일명 생성
    $unique_id = uniqid();
    $timestamp = date('Ymd_His');
    $new_filename = "img_{$timestamp}_{$unique_id}.{$file_extension}";
    $upload_path = $upload_dir . $new_filename;

    // 파일 이동
    if (move_uploaded_file($file['tmp_name'], $upload_path)) {
        // 공개 URL 생성
        $base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . 
                   '://' . $_SERVER['HTTP_HOST'];
        $public_url = $base_url . '/images/uploads/' . $new_filename;

        // 성공 응답
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'image' => [
                'filename' => $new_filename,
                'url' => $public_url,
                'size' => $file['size'],
                'type' => $mime_type,
                'uploaded_by' => $user['id'],
                'uploaded_at' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded file']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>