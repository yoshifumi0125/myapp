<?php
/**
 * Webブラウザからアクセスして動作確認するためのテストページ
 */
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xserver データベース接続テスト</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .success {
            color: #4CAF50;
            background: #e8f5e9;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .error {
            color: #f44336;
            background: #ffebee;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .info {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Xserver データベース接続テスト</h1>
        
        <?php
        // データベース設定
        $config = [
            'host' => 'localhost',
            'username' => 'yoshifumik_1lt67',
            'password' => 'yoshi2003',
            'database' => 'yoshifumik_sass1',
            'charset' => 'utf8mb4'
        ];
        
        try {
            // PDO接続
            $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            
            echo '<div class="success">✅ データベース接続成功！</div>';
            
            // サーバー情報
            echo '<h2>サーバー情報</h2>';
            echo '<div class="info">';
            $version = $pdo->query("SELECT VERSION() as version")->fetch();
            echo "MySQLバージョン: " . htmlspecialchars($version['version']) . "<br>";
            echo "PHP バージョン: " . phpversion() . "<br>";
            echo "サーバー: " . htmlspecialchars($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "<br>";
            echo '</div>';
            
            // テーブル一覧
            echo '<h2>テーブル一覧</h2>';
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            
            if (count($tables) > 0) {
                echo '<ul>';
                foreach ($tables as $table) {
                    $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
                    echo "<li>" . htmlspecialchars($table) . " (レコード数: $count)</li>";
                }
                echo '</ul>';
            } else {
                echo '<div class="error">テーブルが存在しません</div>';
                echo '<p>以下のSQLを実行してテーブルを作成してください：</p>';
                echo '<pre>';
                echo htmlspecialchars('CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    status ENUM(\'active\', \'inactive\') DEFAULT \'active\',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
                echo '</pre>';
            }
            
            // customersテーブルがある場合はデータを表示
            if (in_array('customers', $tables)) {
                echo '<h2>顧客データ（最新5件）</h2>';
                $customers = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC LIMIT 5")->fetchAll();
                
                if (count($customers) > 0) {
                    echo '<table>';
                    echo '<tr><th>ID</th><th>名前</th><th>メール</th><th>電話</th><th>会社</th><th>状態</th><th>作成日</th></tr>';
                    foreach ($customers as $customer) {
                        echo '<tr>';
                        echo '<td>' . htmlspecialchars($customer['id']) . '</td>';
                        echo '<td>' . htmlspecialchars($customer['name']) . '</td>';
                        echo '<td>' . htmlspecialchars($customer['email']) . '</td>';
                        echo '<td>' . htmlspecialchars($customer['phone'] ?? '-') . '</td>';
                        echo '<td>' . htmlspecialchars($customer['company'] ?? '-') . '</td>';
                        echo '<td>' . htmlspecialchars($customer['status']) . '</td>';
                        echo '<td>' . htmlspecialchars($customer['created_at']) . '</td>';
                        echo '</tr>';
                    }
                    echo '</table>';
                } else {
                    echo '<div class="info">顧客データがありません</div>';
                }
            }
            
        } catch (PDOException $e) {
            echo '<div class="error">❌ データベース接続エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
            
            // エラーの詳細情報
            echo '<h3>エラー詳細</h3>';
            echo '<pre>';
            echo 'エラーコード: ' . $e->getCode() . "\n";
            echo 'エラーメッセージ: ' . htmlspecialchars($e->getMessage()) . "\n";
            echo '</pre>';
            
            // トラブルシューティング
            echo '<h3>トラブルシューティング</h3>';
            echo '<ul>';
            echo '<li>データベース名が正しいか確認してください: <code>yoshifumik_sass1</code></li>';
            echo '<li>ユーザー名が正しいか確認してください: <code>yoshifumik_1lt67</code></li>';
            echo '<li>パスワードが正しいか確認してください</li>';
            echo '<li>データベースユーザーに適切な権限があるか確認してください</li>';
            echo '</ul>';
        }
        ?>
        
        <h2>PHPinfo（抜粋）</h2>
        <div class="info">
            <?php
            $info = [
                'PHP Version' => phpversion(),
                'MySQL Client Version' => mysqli_get_client_info(),
                'PDO Drivers' => implode(', ', PDO::getAvailableDrivers()),
                'Default Charset' => ini_get('default_charset'),
                'Memory Limit' => ini_get('memory_limit'),
                'Max Execution Time' => ini_get('max_execution_time') . ' seconds'
            ];
            
            foreach ($info as $key => $value) {
                echo "$key: $value<br>";
            }
            ?>
        </div>
    </div>
</body>
</html>