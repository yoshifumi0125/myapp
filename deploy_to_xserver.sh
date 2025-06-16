#!/bin/bash
# Xserverへのデプロイスクリプト

# 設定
XSERVER_USER="your_username"
XSERVER_HOST="your_server.xserver.jp"
XSERVER_PATH="/home/${XSERVER_USER}/public_html"
LOCAL_BUILD_DIR="./dist"

# 色付き出力用の関数
print_info() {
    echo -e "\033[0;36m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[0;33m[WARNING]\033[0m $1"
}

# 事前チェック
check_requirements() {
    print_info "要件をチェックしています..."
    
    # Node.jsチェック
    if ! command -v node &> /dev/null; then
        print_error "Node.jsがインストールされていません"
        exit 1
    fi
    
    # npmチェック
    if ! command -v npm &> /dev/null; then
        print_error "npmがインストールされていません"
        exit 1
    fi
    
    # .envファイルチェック
    if [ ! -f ".env" ]; then
        print_warning ".envファイルが見つかりません。.env.exampleをコピーして設定してください"
        echo "cp .env.example .env"
        exit 1
    fi
    
    print_success "要件チェック完了"
}

# フロントエンドのビルド
build_frontend() {
    print_info "フロントエンドをビルドしています..."
    
    # 依存関係のインストール
    npm install
    
    # ビルド実行
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "フロントエンドのビルド完了"
    else
        print_error "フロントエンドのビルドに失敗しました"
        exit 1
    fi
}

# ファイルの準備
prepare_files() {
    print_info "デプロイ用ファイルを準備しています..."
    
    # 一時ディレクトリの作成
    TEMP_DIR="./xserver_deploy_temp"
    rm -rf $TEMP_DIR
    mkdir -p $TEMP_DIR
    
    # public_html用のファイル
    mkdir -p $TEMP_DIR/public_html
    cp -r $LOCAL_BUILD_DIR/* $TEMP_DIR/public_html/
    cp .htaccess $TEMP_DIR/public_html/
    
    # cgi-bin用のファイル
    mkdir -p $TEMP_DIR/public_html/cgi-bin
    cp main_xserver.py $TEMP_DIR/public_html/cgi-bin/
    cp config.py $TEMP_DIR/public_html/cgi-bin/
    cp requirements_xserver.txt $TEMP_DIR/public_html/cgi-bin/requirements.txt
    cp .env $TEMP_DIR/public_html/cgi-bin/
    
    # 実行権限の設定
    chmod 755 $TEMP_DIR/public_html/cgi-bin/main_xserver.py
    
    print_success "ファイルの準備完了"
}

# Xserverへのアップロード
upload_to_xserver() {
    print_info "Xserverにファイルをアップロードしています..."
    
    # SSH鍵認証を使用する場合は -i オプションで鍵を指定
    # rsync -avz -e "ssh -i ~/.ssh/xserver_key" $TEMP_DIR/public_html/ $XSERVER_USER@$XSERVER_HOST:$XSERVER_PATH/
    
    rsync -avz --exclude='*.pyc' --exclude='__pycache__' \
        $TEMP_DIR/public_html/ \
        $XSERVER_USER@$XSERVER_HOST:$XSERVER_PATH/
    
    if [ $? -eq 0 ]; then
        print_success "アップロード完了"
    else
        print_error "アップロードに失敗しました"
        exit 1
    fi
}

# Pythonパッケージのインストール（SSH経由）
install_python_packages() {
    print_info "Pythonパッケージをインストールしています..."
    
    ssh $XSERVER_USER@$XSERVER_HOST << 'EOF'
        cd ~/public_html/cgi-bin
        # Xserverでは通常 pip3 を使用
        pip3 install --user -r requirements.txt
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Pythonパッケージのインストール完了"
    else
        print_error "Pythonパッケージのインストールに失敗しました"
        exit 1
    fi
}

# データベースの初期化（必要な場合）
init_database() {
    print_info "データベースの初期化をスキップします（手動で実行してください）"
    print_warning "以下のコマンドをSSH接続後に実行してください："
    echo "cd ~/public_html/cgi-bin"
    echo "python3 -c \"from main_xserver import Base, engine; Base.metadata.create_all(bind=engine)\""
}

# クリーンアップ
cleanup() {
    print_info "一時ファイルをクリーンアップしています..."
    rm -rf $TEMP_DIR
    print_success "クリーンアップ完了"
}

# ヘルスチェック
health_check() {
    print_info "ヘルスチェックを実行しています..."
    
    # URLを.envから取得するか、引数で渡す
    API_URL=$(grep API_BASE_URL .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    
    if [ -z "$API_URL" ]; then
        print_warning "API_URLが設定されていません。手動でヘルスチェックを実行してください"
        echo "curl https://your-domain.com/api/health"
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
        if [ "$response" = "200" ]; then
            print_success "ヘルスチェック成功"
        else
            print_warning "ヘルスチェック失敗 (HTTP $response)"
        fi
    fi
}

# メイン処理
main() {
    print_info "Xserverへのデプロイを開始します"
    
    # 各ステップの実行
    check_requirements
    build_frontend
    prepare_files
    upload_to_xserver
    install_python_packages
    init_database
    cleanup
    health_check
    
    print_success "デプロイが完了しました！"
    print_info "以下のURLでアプリケーションにアクセスできます："
    echo "https://your-domain.com"
}

# 引数の処理
case "$1" in
    "build")
        build_frontend
        ;;
    "upload")
        prepare_files
        upload_to_xserver
        cleanup
        ;;
    "packages")
        install_python_packages
        ;;
    "health")
        health_check
        ;;
    *)
        main
        ;;
esac