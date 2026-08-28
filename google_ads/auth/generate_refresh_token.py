#!/usr/bin/env python3
"""
Interactive helper to generate a fresh Google Ads OAuth2 Refresh Token
and optionally update .env automatically.
"""
import os
import sys
import json
import urllib.parse
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
import webbrowser

from google_ads.config import Config

SCOPE = "https://www.googleapis.com/auth/adwords"
REDIRECT_URI = "http://localhost:8080/"

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    auth_code = None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            OAuthCallbackHandler.auth_code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"""
            <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1 style="color: #2e7d32;">Authentication Successful!</h1>
                <p>You can close this tab and return to your terminal.</p>
            </body>
            </html>
            """)
        else:
            self.send_response(400)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            error = params.get("error", ["Unknown error"])[0]
            self.wfile.write(f"<h1>Authentication Failed</h1><p>{error}</p>".encode("utf-8"))

    def log_message(self, format, *args):
        # Silence default server logging
        return

def exchange_code_for_tokens(client_id: str, client_secret: str, code: str, redirect_uri: str):
    token_url = "https://oauth2.googleapis.com/token"
    params = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri
    }
    data = urllib.parse.urlencode(params).encode("utf-8")
    req = urllib.request.Request(token_url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"\n❌ Error exchanging code: {e.read().decode('utf-8')}")
        return None

def update_env_refresh_token(new_refresh_token: str, env_path: str = ".env"):
    if not os.path.exists(env_path):
        print(f"⚠️ {env_path} not found. Please manually set GOOGLE_ADS_REFRESH_TOKEN={new_refresh_token}")
        return

    with open(env_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    updated = False
    new_lines = []
    for line in lines:
        if line.startswith("GOOGLE_ADS_REFRESH_TOKEN="):
            new_lines.append(f'GOOGLE_ADS_REFRESH_TOKEN="{new_refresh_token}"\n')
            updated = True
        else:
            new_lines.append(line)

    if not updated:
        new_lines.append(f'\nGOOGLE_ADS_REFRESH_TOKEN="{new_refresh_token}"\n')

    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print(f"✅ Updated GOOGLE_ADS_REFRESH_TOKEN in {env_path}")

def main():
    client_id = Config.CLIENT_ID
    client_secret = Config.CLIENT_SECRET

    if not client_id or not client_secret:
        print("❌ GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET is missing in .env")
        sys.exit(1)

    print("=" * 70)
    print("🔑 Google Ads OAuth2 Refresh Token Generator")
    print("=" * 70)
    print(f"Client ID: {client_id}")
    print(f"Scope    : {SCOPE}")
    print(f"Redirect : {REDIRECT_URI}")
    print("=" * 70)

    auth_url_params = {
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(auth_url_params)}"

    print("\n👉 Option A (Browser Flow):")
    print("1. Ensure http://localhost:8080/ is added to 'Authorized redirect URIs' in Google Cloud Console.")
    print("2. Open this link in your browser:")
    print(f"\n{auth_url}\n")
    print("Waiting for callback on http://localhost:8080/ (Press Ctrl+C to cancel)...")

    try:
        server = HTTPServer(("localhost", 8080), OAuthCallbackHandler)
        server.handle_request() # wait for single callback request
    except KeyboardInterrupt:
        print("\nAborted.")
        sys.exit(1)

    code = OAuthCallbackHandler.auth_code
    if not code:
        print("❌ Did not receive authorization code.")
        sys.exit(1)

    print("\n🔄 Exchanging authorization code for refresh token...")
    tokens = exchange_code_for_tokens(client_id, client_secret, code, REDIRECT_URI)

    if tokens and "refresh_token" in tokens:
        refresh_token = tokens["refresh_token"]
        print("\n🎉 SUCCESS! New Refresh Token generated:")
        print(f"{refresh_token}\n")
        update_env_refresh_token(refresh_token)
        print("You can now test the connection with:")
        print(".venv/bin/python -c 'from google_ads.auth.checker import AuthChecker; AuthChecker.check_auth()'")
    else:
        print("\n❌ Failed to obtain refresh token. Response:")
        print(tokens)

if __name__ == "__main__":
    main()
