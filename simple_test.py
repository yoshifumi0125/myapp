#!/usr/bin/env python3
"""
シンプルなテスト用Flaskアプリ
"""
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return """
    <h1>SaaS App Test Page</h1>
    <p>Flask is working!</p>
    <ul>
        <li><a href="/test">Test API</a></li>
        <li><a href="/info">Server Info</a></li>
    </ul>
    """

@app.route('/test')
def test():
    return jsonify({
        "status": "ok",
        "message": "API is working!",
        "python_version": os.sys.version
    })

@app.route('/info')
def info():
    return jsonify({
        "working_directory": os.getcwd(),
        "environment": dict(os.environ),
        "python_path": os.sys.path
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting test server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)