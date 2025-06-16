# Haconiwa Mini CLI ツール

haconiwa の `start`/`stop` 機能を模した2つのCLIツールを作成しました。

## 1. haconiwa_mini.py - 基本版

シンプルなstart/stop機能を持つCLIツール。

### 使用方法

```bash
# 会社（tmuxセッション）を開始
./haconiwa_mini.py start my-company

# カスタム組織名とタスクで開始
./haconiwa_mini.py start my-company \
  --org1 "フロントエンド" "React開発" \
  --org2 "バックエンド" "API開発" \
  --org3 "データベース" "スキーマ設計" \
  --org4 "DevOps" "CI/CD構築"

# 会社一覧表示
./haconiwa_mini.py list

# 会社に接続
./haconiwa_mini.py attach my-company

# 全ペインでコマンド実行
./haconiwa_mini.py run my-company --cmd "echo Hello"

# 特定の組織/役割でフィルタしてコマンド実行
./haconiwa_mini.py run my-company --cmd "pwd" --filter "frontend"

# 会社を停止
./haconiwa_mini.py stop my-company

# 会社を停止し、ディレクトリも削除
./haconiwa_mini.py stop my-company --clean-dirs
```

### 機能
- 4x4グリッド（16ペイン）のtmuxセッション作成
- 組織構造：4組織 × (PM + Worker×3)
- 自動ディレクトリ構造生成
- セッション状態の永続化

## 2. haconiwa_mini_yaml.py - YAML設定版

YAML設定ファイルによる宣言的な環境管理。

### 使用方法

```bash
# サンプルYAML生成
./haconiwa_mini_yaml.py example

# YAML設定を適用
./haconiwa_mini_yaml.py apply -f haconiwa-example.yaml

# ドライラン（実行計画の確認）
./haconiwa_mini_yaml.py apply -f haconiwa-example.yaml --dry-run

# 会社一覧
./haconiwa_mini_yaml.py list

# 特定のルームに接続
./haconiwa_mini_yaml.py attach dev-company -r frontend

# 停止
./haconiwa_mini_yaml.py stop dev-company --clean-dirs
```

### YAML設定例

```yaml
version: "1.0"
metadata:
  description: "Multi-room development environment"

space:
  name: "dev-company"
  base_path: "./dev-workspace"
  
  rooms:
    - name: "frontend"
      description: "Frontend development room"
    - name: "backend"
      description: "Backend development room"
  
  agents:
    - name: "frontend-pm"
      role: "pm"
      room: "frontend"
      organization: "frontend-team"
      task: "Coordinate UI/UX development"
    
    - name: "react-dev"
      role: "worker"
      room: "frontend"
      organization: "frontend-team"
      task: "Implement React components"
```

### 機能
- マルチルーム（tmux window）対応
- 柔軟なエージェント配置
- 宣言的な環境定義
- ドライラン機能
- 初期化コマンドのサポート

## 必要な環境

- Python 3.6+
- tmux
- PyYAML (YAML版のみ)

```bash
# PyYAMLのインストール（YAML版を使う場合）
pip install pyyaml
```

## ディレクトリ構造

両ツールとも以下のような構造を自動生成：

```
haconiwa-workspaces/
├── my-company/
│   ├── org-01/
│   │   ├── 01boss/
│   │   ├── 01worker-a/
│   │   ├── 01worker-b/
│   │   └── 01worker-c/
│   └── ...
└── .haconiwa/
    └── sessions.json
```

## 主な違い

| 機能 | haconiwa_mini.py | haconiwa_mini_yaml.py |
|------|------------------|----------------------|
| 設定方法 | コマンドライン引数 | YAMLファイル |
| ルーム（Window）対応 | ✗ | ✓ |
| 柔軟なエージェント配置 | ✗ | ✓ |
| ドライラン | ✗ | ✓ |
| 初期化コマンド | ✗ | ✓ |