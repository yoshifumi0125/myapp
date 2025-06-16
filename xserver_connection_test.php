<?php
/**
 * Xserver接続方法の総合テスト
 */

echo "========================================\n";
echo "Xserver 接続テストスクリプト\n";
echo "========================================\n\n";

// 利用可能な接続方法
$methods = [
    'xserver_direct' => [
        'name' => 'Xserver直接接続（本番環境想定）',
        'host' => 'localhost',
        'user' => 'yoshifumik_1lt67',
        'pass' => 'yoshi2003',
        'db' => 'yoshifumik_sass1',
        'port' => 3306,
        'note' => 'Xserverにアップロードして実行する場合'
    ],
    'local_mysql' => [
        'name' => 'ローカルMySQL',
        'host' => '127.0.0.1',
        'user' => 'root',
        'pass' => '',
        'db' => 'test',
        'port' => 3306,
        'note' => 'ローカル開発環境のMySQL'
    ],
    'ssh_tunnel' => [
        'name' => 'SSH トンネル経由',
        'host' => '127.0.0.1',
        'user' => 'yoshifumik_1lt67',
        'pass' => 'yoshi2003',
        'db' => 'yoshifumik_sass1',
        'port' => 3307,
        'note' => 'SSH -L 3307:localhost:3306 経由'
    ]
];

// 各方法をテスト
foreach ($methods as $key => $config) {
    echo "🔍 テスト: {$config['name']}\n";
    echo "   接続先: {$config['host']}:{$config['port']}\n";
    echo "   データベース: {$config['db']}\n";
    echo "   備考: {$config['note']}\n";
    
    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['db']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['user'], $config['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5  // 5秒タイムアウト
        ]);
        
        echo "   ✅ 接続成功！\n";
        
        // バージョン取得
        $version = $pdo->query("SELECT VERSION()")->fetchColumn();
        echo "   MySQLバージョン: $version\n";
        
    } catch (PDOException $e) {
        echo "   ❌ 接続失敗: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

// 推奨事項
echo "========================================\n";
echo "📌 推奨事項:\n";
echo "========================================\n\n";

echo "1. 【Xserverでの実行】\n";
echo "   このファイルをXserverにアップロードして、\n";
echo "   https://yoshifumik.xsrv.jp/xserver_connection_test.php\n";
echo "   でアクセスしてください。\n\n";

echo "2. 【SSHトンネルの設定】\n";
echo "   Xserverの管理画面でSSHポート番号を確認し、\n";
echo "   以下のようにトンネルを作成：\n";
echo "   ssh -p [ポート番号] -L 3307:localhost:3306 yoshifumik@sv14067.xserver.jp\n\n";

echo "3. 【ローカル開発】\n";
echo "   開発中はローカルのMySQLを使用し、\n";
echo "   本番環境にデプロイ時に設定を切り替える。\n\n";

// PHPinfo（MySQL関連のみ）
echo "========================================\n";
echo "🔧 PHP環境情報:\n";
echo "========================================\n";
echo "PHP Version: " . phpversion() . "\n";
echo "PDO Drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";

if (extension_loaded('mysqli')) {
    echo "mysqli: ✓ 利用可能\n";
} else {
    echo "mysqli: ✗ 利用不可\n";
}

if (extension_loaded('pdo_mysql')) {
    echo "pdo_mysql: ✓ 利用可能\n";
} else {
    echo "pdo_mysql: ✗ 利用不可\n";
}
?>