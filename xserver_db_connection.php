<?php
// Xserver MySQL接続設定
$config = [
    'host' => 'localhost',
    'username' => 'yoshifumik_1lt67',
    'password' => 'yoshi2003',
    'database' => 'yoshifumik_sass1',
    'charset' => 'utf8mb4'
];

// エラー表示設定（開発環境のみ）
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // PDOを使用した接続
    $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
    
    echo "✅ データベース接続成功！\n";
    
    // 接続テスト：バージョン確認
    $stmt = $pdo->query("SELECT VERSION() as version");
    $version = $stmt->fetch();
    echo "MySQLバージョン: " . $version['version'] . "\n";
    
    // テーブル一覧取得
    echo "\n📋 テーブル一覧:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
    // customersテーブルのデータ取得例
    if (in_array('customers', $tables)) {
        echo "\n👥 顧客データ（最新5件）:\n";
        $stmt = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC LIMIT 5");
        $customers = $stmt->fetchAll();
        
        foreach ($customers as $customer) {
            echo sprintf("  ID: %d, 名前: %s, メール: %s\n", 
                $customer['id'], 
                $customer['name'], 
                $customer['email']
            );
        }
    }
    
} catch (PDOException $e) {
    echo "❌ データベース接続エラー: " . $e->getMessage() . "\n";
    exit(1);
}

// 関数形式での接続取得
function getXserverConnection() {
    $config = [
        'host' => 'localhost',
        'username' => 'yoshifumik_1lt67',
        'password' => 'yoshi2003',
        'database' => 'yoshifumik_sass1',
        'charset' => 'utf8mb4'
    ];
    
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        return new PDO($dsn, $config['username'], $config['password'], $options);
    } catch (PDOException $e) {
        throw new Exception("データベース接続エラー: " . $e->getMessage());
    }
}

// mysqli版の接続（互換性のため）
function getXserverMysqliConnection() {
    $config = [
        'host' => 'localhost',
        'username' => 'yoshifumik_1lt67',
        'password' => 'yoshi2003',
        'database' => 'yoshifumik_sass1'
    ];
    
    $mysqli = new mysqli(
        $config['host'],
        $config['username'],
        $config['password'],
        $config['database']
    );
    
    if ($mysqli->connect_error) {
        throw new Exception("接続エラー: " . $mysqli->connect_error);
    }
    
    $mysqli->set_charset("utf8mb4");
    
    return $mysqli;
}
?>