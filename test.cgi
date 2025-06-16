#!/usr/bin/env python3
# -*- coding: utf-8 -*-

print("Content-Type: text/html; charset=utf-8")
print()
print("<html>")
print("<head><title>Python CGI Test</title></head>")
print("<body>")
print("<h1>Python CGI is working!</h1>")
print("<p>If you see this, Python CGI is configured correctly.</p>")

import sys
print(f"<p>Python version: {sys.version}</p>")

import os
print("<h2>Environment Variables:</h2>")
print("<ul>")
for key, value in sorted(os.environ.items()):
    if not key.startswith('DB_PASSWORD'):
        print(f"<li>{key}: {value}</li>")
print("</ul>")

print("</body>")
print("</html>")