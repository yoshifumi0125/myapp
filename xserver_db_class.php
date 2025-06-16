<?php
/**
 * Xserver MySQL データベースクラス
 * 再利用可能なデータベース操作クラス
 */
class XserverDB {
    private $pdo;
    private $config;
    
    public function __construct() {
        $this->config = [
            'host' => 'localhost',
            'username' => 'yoshifumik_1lt67',
            'password' => 'yoshi2003',
            'database' => 'yoshifumik_sass1',
            'charset' => 'utf8mb4'
        ];
        
        $this->connect();
    }
    
    /**
     * データベースに接続
     */
    private function connect() {
        try {
            $dsn = "mysql:host={$this->config['host']};dbname={$this->config['database']};charset={$this->config['charset']}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->pdo = new PDO($dsn, $this->config['username'], $this->config['password'], $options);
        } catch (PDOException $e) {
            throw new Exception("データベース接続エラー: " . $e->getMessage());
        }
    }
    
    /**
     * SELECT文を実行
     */
    public function select($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("SELECTエラー: " . $e->getMessage());
        }
    }
    
    /**
     * 単一行を取得
     */
    public function selectOne($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("SELECTエラー: " . $e->getMessage());
        }
    }
    
    /**
     * INSERT文を実行
     */
    public function insert($table, $data) {
        try {
            $columns = array_keys($data);
            $values = array_map(function($col) { return ':' . $col; }, $columns);
            
            $sql = "INSERT INTO $table (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ")";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($data);
            
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("INSERTエラー: " . $e->getMessage());
        }
    }
    
    /**
     * UPDATE文を実行
     */
    public function update($table, $data, $where, $whereParams = []) {
        try {
            $setParts = [];
            foreach ($data as $column => $value) {
                $setParts[] = "$column = :$column";
            }
            
            $sql = "UPDATE $table SET " . implode(', ', $setParts) . " WHERE $where";
            
            $params = array_merge($data, $whereParams);
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new Exception("UPDATEエラー: " . $e->getMessage());
        }
    }
    
    /**
     * DELETE文を実行
     */
    public function delete($table, $where, $params = []) {
        try {
            $sql = "DELETE FROM $table WHERE $where";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new Exception("DELETEエラー: " . $e->getMessage());
        }
    }
    
    /**
     * トランザクション開始
     */
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }
    
    /**
     * コミット
     */
    public function commit() {
        return $this->pdo->commit();
    }
    
    /**
     * ロールバック
     */
    public function rollback() {
        return $this->pdo->rollBack();
    }
    
    /**
     * PDOインスタンスを取得
     */
    public function getPDO() {
        return $this->pdo;
    }
}

// 使用例
try {
    $db = new XserverDB();
    
    // 顧客一覧取得
    $customers = $db->select("SELECT * FROM customers WHERE status = :status", ['status' => 'active']);
    
    // 新規顧客追加
    $newCustomerId = $db->insert('customers', [
        'name' => '山田太郎',
        'email' => 'yamada@example.com',
        'phone' => '090-1234-5678',
        'status' => 'active',
        'created_at' => date('Y-m-d H:i:s')
    ]);
    
    // 顧客情報更新
    $updatedRows = $db->update('customers', 
        ['email' => 'new-email@example.com'],
        'id = :id',
        ['id' => $newCustomerId]
    );
    
    echo "データベース操作が正常に完了しました。\n";
    
} catch (Exception $e) {
    echo "エラー: " . $e->getMessage() . "\n";
}
?>