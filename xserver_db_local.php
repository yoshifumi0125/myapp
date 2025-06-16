<?php
/**
 * Xserver MySQL ローカル接続用スクリプト
 * SSH トンネル経由またはGoogle Cloud SQL経由で接続
 */

// 接続設定を選択
$use_ssh_tunnel = false;  // SSH トンネルを使用する場合は true
$use_google_cloud = true; // Google Cloud SQLを使用する場合は true

if ($use_ssh_tunnel) {
    // SSH トンネル経由の設定（.env.local_xserverから）
    $config = [
        'host' => '127.0.0.1',
        'username' => 'yoshifumik_1lt67',
        'password' => 'yoshi2003',
        'database' => 'yoshifumik_sass1',
        'port' => '3307',  // SSH トンネルのローカルポート
        'charset' => 'utf8mb4'
    ];
    
    echo "📡 SSH トンネル経由で接続を試行中...\n";
    echo "   ※ 事前に以下のコマンドでSSHトンネルを開始してください:\n";
    echo "   ./ssh_tunnel.sh\n\n";
    
} elseif ($use_google_cloud) {
    // Google Cloud SQL の設定（.envから）
    $config = [
        'host' => '35.232.151.129',
        'username' => 'root',
        'password' => 'yoshi0406',
        'database' => 'saas1',
        'port' => '3306',
        'charset' => 'utf8mb4'
    ];
    
    echo "☁️  Google Cloud SQL に接続を試行中...\n\n";
    
} else {
    // ローカルMySQLの設定
    $config = [
        'host' => '127.0.0.1',
        'username' => 'root',
        'password' => '',
        'database' => 'test',
        'port' => '3306',
        'charset' => 'utf8mb4'
    ];
    
    echo "💻 ローカルMySQLに接続を試行中...\n\n";
}

try {
    // PDO接続
    $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
    
    echo "✅ データベース接続成功！\n";
    echo "接続先: {$config['host']}:{$config['port']}/{$config['database']}\n\n";
    
    // バージョン確認
    $stmt = $pdo->query("SELECT VERSION() as version");
    $version = $stmt->fetch();
    echo "MySQLバージョン: " . $version['version'] . "\n\n";
    
    // テーブル一覧
    echo "📋 テーブル一覧:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        foreach ($tables as $table) {
            $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            echo "  - $table (レコード数: $count)\n";
        }
    } else {
        echo "  テーブルがありません\n";
    }
    
    // customersテーブルの確認
    if (in_array('customers', $tables)) {
        echo "\n👥 顧客データサンプル（最新3件）:\n";
        $stmt = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC LIMIT 3");
        $customers = $stmt->fetchAll();
        
        foreach ($customers as $customer) {
            echo "  - {$customer['name']} ({$customer['email']})\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ データベース接続エラー: " . $e->getMessage() . "\n\n";
    
    // トラブルシューティング
    echo "🔧 トラブルシューティング:\n";
    
    if ($use_ssh_tunnel) {
        echo "1. SSH トンネルが起動しているか確認:\n";
        echo "   ps aux | grep ssh | grep 3307\n\n";
        echo "2. SSH トンネルを開始:\n";
        echo "   ./ssh_tunnel.sh\n\n";
        echo "3. ポート3307が使用可能か確認:\n";
        echo "   lsof -i :3307\n";
    } elseif ($use_google_cloud) {
        echo "1. Google Cloud SQLのIPアドレスが正しいか確認\n";
        echo "2. ファイアウォールルールでアクセスが許可されているか確認\n";
        echo "3. Cloud SQL Admin APIが有効か確認\n";
    } else {
        echo "1. MySQLサーバーが起動しているか確認:\n";
        echo "   mysql.server status\n\n";
        echo "2. MySQLサーバーを起動:\n";
        echo "   mysql.server start\n";
    }
}
?>