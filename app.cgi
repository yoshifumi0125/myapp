#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
XServer CGIモード用エントリーポイント
"""

import sys
import os

# Pythonパスの設定（必要に応じて調整）
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 環境変数の読み込み
from pathlib import Path
env_file = Path(__file__).parent / '.env.xserver'
if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                os.environ[key] = value

# Flaskアプリケーションのインポート
from main import app

# CGIハンドラーの設定
from wsgiref.handlers import CGIHandler

# CGIとして実行
if __name__ == '__main__':
    CGIHandler().run(app)