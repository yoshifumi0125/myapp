<?php
/**
 * Xserver テーブル作成スクリプト（Web版）
 */
header('Content-Type: text/html; charset=utf-8');

// データベース設定
$config = [
    'host' => 'localhost',
    'username' => 'yoshifumik_1lt67',
    'password' => 'yoshi2003',
    'database' => 'yoshifumik_sass1',
    'charset' => 'utf8mb4'
];
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xserver テーブル作成</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 900px;
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
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .error {
            color: #f44336;
            background: #ffebee;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .warning {
            background: #fff3e0;
            color: #ff6f00;
            padding: 15px;
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
            padding: 12px;
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
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border: 1px solid #ddd;
        }
        .sql-box {
            background: #263238;
            color: #aed581;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
        }
        .button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 0;
        }
        .button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Xserver テーブル作成</h1>
        
        <?php
        try {
            // PDO接続
            $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ];
            
            $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            
            echo '<div class="success">✅ データベース接続成功！</div>';
            
            // 既存のテーブルを確認
            echo '<h2>📋 既存のテーブル確認</h2>';
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            
            if (count($tables) > 0) {
                echo '<div class="info">既存のテーブル: ' . implode(', ', $tables) . '</div>';
            } else {
                echo '<div class="warning">⚠️ テーブルが存在しません。新規作成します。</div>';
            }
            
            // テーブル作成処理
            if (isset($_POST['create_tables'])) {
                echo '<h2>🔨 テーブル作成実行</h2>';
                
                $created = 0;
                $errors = 0;
                
                // customersテーブル
                try {
                    $sql = "CREATE TABLE IF NOT EXISTS customers (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        phone VARCHAR(20),
                        company VARCHAR(100),
                        status ENUM('active', 'inactive') DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_email (email),
                        INDEX idx_status (status)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                    
                    $pdo->exec($sql);
                    echo '<div class="success">✅ customersテーブルを作成しました</div>';
                    $created++;
                } catch (PDOException $e) {
                    echo '<div class="error">❌ customersテーブル作成エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
                    $errors++;
                }
                
                // messagesテーブル
                try {
                    $sql = "CREATE TABLE IF NOT EXISTS messages (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_id INT,
                        subject VARCHAR(200) NOT NULL,
                        message TEXT NOT NULL,
                        status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                        INDEX idx_customer_id (customer_id),
                        INDEX idx_status (status)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                    
                    $pdo->exec($sql);
                    echo '<div class="success">✅ messagesテーブルを作成しました</div>';
                    $created++;
                } catch (PDOException $e) {
                    echo '<div class="error">❌ messagesテーブル作成エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
                    $errors++;
                }
                
                // ordersテーブル
                try {
                    $sql = "CREATE TABLE IF NOT EXISTS orders (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        customer_id INT,
                        order_number VARCHAR(20) UNIQUE NOT NULL,
                        total_amount DECIMAL(10,2) NOT NULL,
                        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
                        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
                        INDEX idx_order_number (order_number),
                        INDEX idx_customer_id (customer_id),
                        INDEX idx_status (status)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                    
                    $pdo->exec($sql);
                    echo '<div class="success">✅ ordersテーブルを作成しました</div>';
                    $created++;
                } catch (PDOException $e) {
                    echo '<div class="error">❌ ordersテーブル作成エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
                    $errors++;
                }
                
                // サンプルデータ挿入
                if (isset($_POST['insert_sample']) && $created > 0) {
                    echo '<h3>📝 サンプルデータ挿入</h3>';
                    
                    // 顧客データ
                    $customers = [
                        ['name' => '山田太郎', 'email' => 'yamada@example.com', 'phone' => '090-1234-5678', 'company' => '山田商事'],
                        ['name' => '佐藤花子', 'email' => 'sato@example.com', 'phone' => '080-2345-6789', 'company' => '佐藤工業'],
                        ['name' => '鈴木一郎', 'email' => 'suzuki@example.com', 'phone' => '070-3456-7890', 'company' => '鈴木システム'],
                    ];
                    
                    $stmt = $pdo->prepare("INSERT INTO customers (name, email, phone, company) VALUES (:name, :email, :phone, :company)");
                    
                    foreach ($customers as $customer) {
                        try {
                            $stmt->execute($customer);
                            echo '<div class="success">✅ 顧客追加: ' . htmlspecialchars($customer['name']) . '</div>';
                        } catch (PDOException $e) {
                            if ($e->getCode() == '23000') {
                                echo '<div class="warning">⚠️ 顧客スキップ（既存）: ' . htmlspecialchars($customer['email']) . '</div>';
                            } else {
                                echo '<div class="error">❌ エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
                            }
                        }
                    }
                }
                
                echo '<div class="info">作成完了: ' . $created . ' テーブル / エラー: ' . $errors . ' 件</div>';
            }
            
            // 現在のテーブル状態を表示
            echo '<h2>📊 現在のテーブル状態</h2>';
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            
            if (count($tables) > 0) {
                echo '<table>';
                echo '<tr><th>テーブル名</th><th>レコード数</th><th>カラム数</th><th>エンジン</th></tr>';
                
                foreach ($tables as $table) {
                    $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
                    $columns = $pdo->query("SHOW COLUMNS FROM `$table`")->rowCount();
                    $status = $pdo->query("SHOW TABLE STATUS WHERE Name = '$table'")->fetch();
                    
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($table) . '</td>';
                    echo '<td>' . $count . '</td>';
                    echo '<td>' . $columns . '</td>';
                    echo '<td>' . htmlspecialchars($status['Engine']) . '</td>';
                    echo '</tr>';
                }
                echo '</table>';
            } else {
                echo '<div class="warning">テーブルがありません。下のボタンをクリックして作成してください。</div>';
            }
            
        } catch (PDOException $e) {
            echo '<div class="error">❌ データベース接続エラー: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
        ?>
        
        <h2>🚀 アクション</h2>
        <form method="post">
            <label>
                <input type="checkbox" name="insert_sample" value="1" checked>
                サンプルデータも挿入する
            </label><br>
            <button type="submit" name="create_tables" value="1" class="button">
                テーブルを作成する
            </button>
        </form>
        
        <h2>📝 作成されるテーブル構造</h2>
        <h3>1. customersテーブル（顧客情報）</h3>
        <div class="sql-box">
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
        </div>
        
        <h3>2. messagesテーブル（メッセージ）</h3>
        <div class="sql-box">
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
)
        </div>
        
        <h3>3. ordersテーブル（注文情報）</h3>
        <div class="sql-box">
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
)
        </div>
    </div>
</body>
</html>