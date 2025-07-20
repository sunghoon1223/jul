<?php
/**
 * Database Configuration for JP Caster
 * Hostinger MySQL Connection
 */

class Database {
    // 호스팅거 데이터베이스 설정 (실제 값으로 변경 필요)
    private $host = "localhost";
    private $db_name = "jpcaster_db";
    private $username = "jpcaster_user";
    private $password = "secure_password_123";
    private $conn;

    // 데이터베이스 연결
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }

    // 연결 종료
    public function closeConnection() {
        $this->conn = null;
    }
}

// 환경별 설정
if (isset($_ENV['DB_HOST'])) {
    // 환경변수가 있는 경우 (프로덕션)
    $db_config = [
        'host' => $_ENV['DB_HOST'] ?? 'localhost',
        'dbname' => $_ENV['DB_NAME'] ?? 'jpcaster_db',
        'username' => $_ENV['DB_USER'] ?? 'root',
        'password' => $_ENV['DB_PASS'] ?? ''
    ];
} else {
    // 기본 설정 (개발환경)
    $db_config = [
        'host' => 'localhost',
        'dbname' => 'jpcaster_db',
        'username' => 'jpcaster_user',
        'password' => 'secure_password_123'
    ];
}
?>