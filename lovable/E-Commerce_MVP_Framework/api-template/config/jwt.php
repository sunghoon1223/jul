<?php
/**
 * JWT Configuration and Helper Functions
 * Simple JWT implementation for authentication
 */

class JWT {
    // JWT 시크릿 키 (프로덕션에서는 환경변수로 관리)
    private static $secret_key = "jpcaster_jwt_secret_key_2025_secure";
    private static $algorithm = 'HS256';
    private static $expiration = 3600; // 1시간

    /**
     * JWT 토큰 생성
     */
    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        
        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expiration;
        $payload = json_encode($payload);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * JWT 토큰 검증 및 디코딩
     */
    public static function decode($jwt) {
        $tokenParts = explode('.', $jwt);
        
        if (count($tokenParts) !== 3) {
            return false;
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signatureProvided = $tokenParts[2];

        // 서명 검증
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($base64Signature, $signatureProvided)) {
            return false;
        }

        $payload = json_decode($payload, true);

        // 만료 시간 확인
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    /**
     * Authorization 헤더에서 토큰 추출
     */
    public static function getBearerToken() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $matches = [];
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }

    /**
     * 현재 사용자 정보 가져오기
     */
    public static function getCurrentUser() {
        $token = self::getBearerToken();
        
        if (!$token) {
            return null;
        }

        $decoded = self::decode($token);
        
        if (!$decoded) {
            return null;
        }

        return $decoded;
    }

    /**
     * 관리자 권한 확인
     */
    public static function requireAdmin() {
        $user = self::getCurrentUser();
        
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            exit;
        }

        return $user;
    }

    /**
     * 로그인 필수 확인
     */
    public static function requireAuth() {
        $user = self::getCurrentUser();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }

        return $user;
    }
}

/**
 * CORS 헤더 설정
 */
function setCorsHeaders() {
    // 개발환경에서는 모든 오리진 허용, 프로덕션에서는 특정 도메인만 허용
    $allowed_origins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'https://jpcaster.co.kr',
        'https://www.jpcaster.co.kr'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");

    // OPTIONS 요청 처리
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * JSON 응답 헬퍼
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * 에러 응답 헬퍼
 */
function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message], $status);
}

/**
 * 성공 응답 헬퍼
 */
function successResponse($data = null, $message = 'Success') {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    jsonResponse($response);
}
?>