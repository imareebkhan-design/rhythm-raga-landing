import re
from typing import Dict, Any, List, Tuple
from google_ads.config import Config
from google_ads.auth.oauth import GoogleAdsAuth

class AuthChecker:
    """
    Validates environment credentials, OAuth2 token refresh, and Google Ads account accessibility.
    """

    @classmethod
    def check_auth(cls) -> Dict[str, Any]:
        """
        Runs comprehensive authentication and permission diagnostic checks.
        Never outputs raw secret credentials.
        """
        print("=" * 60)
        print("Google Ads Authentication Check")
        print("=" * 60)

        checks: List[Tuple[str, bool, str]] = []
        errors: List[str] = []

        # 1. Developer Token
        dev_token = Config.DEVELOPER_TOKEN
        if dev_token:
            checks.append(("Developer token found", True, "OK"))
        else:
            checks.append(("Developer token found", False, "Missing GOOGLE_ADS_DEVELOPER_TOKEN"))
            errors.append("GOOGLE_ADS_DEVELOPER_TOKEN is missing.")

        # 2. Client ID
        client_id = Config.CLIENT_ID
        if client_id:
            checks.append(("OAuth client ID found", True, "OK"))
        else:
            checks.append(("OAuth client ID found", False, "Missing GOOGLE_ADS_CLIENT_ID"))
            errors.append("GOOGLE_ADS_CLIENT_ID is missing.")

        # 3. Client Secret
        client_secret = Config.CLIENT_SECRET
        if client_secret:
            checks.append(("OAuth client secret found", True, "OK"))
        else:
            checks.append(("OAuth client secret found", False, "Missing GOOGLE_ADS_CLIENT_SECRET"))
            errors.append("GOOGLE_ADS_CLIENT_SECRET is missing.")

        # 4. Refresh Token
        refresh_token = Config.REFRESH_TOKEN
        if refresh_token:
            checks.append(("Refresh token found", True, "OK"))
        else:
            checks.append(("Refresh token found", False, "Missing GOOGLE_ADS_REFRESH_TOKEN"))
            errors.append("GOOGLE_ADS_REFRESH_TOKEN is missing.")

        # 5. Customer ID Format
        cid = Config.CUSTOMER_ID
        if cid and len(cid) == 10 and cid.isdigit():
            checks.append(("Customer ID format valid", True, f"Formatted ID: {cid}"))
        else:
            msg = "Must be a 10-digit number without hyphens" if cid else "Missing GOOGLE_ADS_CUSTOMER_ID"
            checks.append(("Customer ID format valid", False, msg))
            errors.append(f"GOOGLE_ADS_CUSTOMER_ID invalid: {msg}")

        # 6. Login Customer ID Format (Optional)
        login_cid = Config.LOGIN_CUSTOMER_ID
        if login_cid:
            if len(login_cid) == 10 and login_cid.isdigit():
                checks.append(("Login Customer ID format valid", True, f"Formatted ID: {login_cid}"))
            else:
                checks.append(("Login Customer ID format valid", False, "Must be a 10-digit number without hyphens"))
                errors.append("GOOGLE_ADS_LOGIN_CUSTOMER_ID format invalid.")

        # Print initial credential checks
        for label, passed, detail in checks:
            mark = "✓" if passed else "✗"
            print(f"{mark} {label}")

        if errors:
            print("\n" + "=" * 60)
            print(f"Customer ID: {cid or 'NOT_SET'}")
            print(f"Login Customer ID: {login_cid or 'Not specified (Direct access)'}")
            print("API Version: " + Config.API_VERSION)
            print("\nSTATUS: NOT READY")
            print("Unresolved issues:")
            for err in errors:
                print(f"  • {err}")
            print("=" * 60)
            return {"status": "NOT_READY", "errors": errors}

        # 7. OAuth2 Token Refresh Check
        print("\nAttempting OAuth2 access token refresh...")
        token = GoogleAdsAuth.get_access_token(force_refresh=True)
        if token:
            print("✓ OAuth refresh successful")
        else:
            print("✗ OAuth refresh failed")
            print("\nSTATUS: NOT READY (OAuth token refresh error)")
            return {"status": "NOT_READY", "errors": ["OAuth authentication token refresh failed."]}

        # 8. Harmless API Query Test to Verify Account Accessibility
        print(f"Verifying access to target customer account {cid}...")
        gaql = "SELECT customer.id, customer.descriptive_name, customer.status FROM customer LIMIT 1"
        try:
            from google_ads.client.ads_client import GoogleAdsClient, GoogleAdsClientError
            res = GoogleAdsClient.search(gaql)
            rows = res.get("results", [])
            account_name = "Accessible Account"
            if rows:
                c_info = rows[0].get("customer", {})
                account_name = c_info.get("descriptiveName", account_name)

            print("✓ Developer token accepted")
            print("✓ Customer account accessible")
            print(f"\nAccount Name: {account_name}")
            print(f"Customer ID: {cid}")
            print(f"Login Customer ID: {login_cid or 'Not specified (Direct access)'}")
            print(f"API Version: {Config.API_VERSION}")
            print("\nSTATUS: READY")
            print("=" * 60)
            return {"status": "READY", "customer_id": cid, "account_name": account_name}

        except Exception as e:
            print(f"✗ Customer account access failed: {e}")
            print("\nSTATUS: NOT READY (API authorization error)")
            print("=" * 60)
            return {"status": "NOT_READY", "errors": [str(e)]}

    @classmethod
    def list_accounts(cls) -> Dict[str, Any]:
        """
        Lists all accessible Google Ads customer accounts for the authenticated user.
        """
        print("=" * 60)
        print("Accessible Google Ads Customer Accounts Discovery")
        print("=" * 60)

        token = GoogleAdsAuth.get_access_token()
        if not token:
            print("❌ Cannot list accounts: OAuth authentication failed. Please check credentials in .env.")
            return {"status": "FAILED", "accounts": []}

        try:
            from google_ads.client.ads_client import GoogleAdsClient, GoogleAdsClientError
            resource_names = GoogleAdsClient.list_accessible_customers()
            if not resource_names:
                print("⚠️ No accessible customer accounts returned for this OAuth user.")
                return {"status": "EMPTY", "accounts": []}

            print(f"Found {len(resource_names)} accessible account(s):\n")
            parsed_accounts = []

            for idx, rn in enumerate(resource_names, start=1):
                raw_id = rn.split("/")[-1]
                formatted_id = f"{raw_id[:3]}-{raw_id[3:6]}-{raw_id[6:]}" if len(raw_id) == 10 else raw_id
                print(f"  {idx}. {rn:<30} (Customer ID: {raw_id} / {formatted_id})")
                parsed_accounts.append({
                    "resource_name": rn,
                    "customer_id": raw_id,
                    "formatted_id": formatted_id
                })

            print("\n💡 Recommendation:")
            print("  • Set GOOGLE_ADS_CUSTOMER_ID to your target client account ID (10 digits).")
            print("  • Set GOOGLE_ADS_LOGIN_CUSTOMER_ID to your Manager Account (MCC) ID if accessing client via manager account.")
            print("=" * 60)

            return {"status": "SUCCESS", "accounts": parsed_accounts}

        except GoogleAdsClientError as e:
            print(f"❌ Failed to query accessible accounts: {e}")
            return {"status": "FAILED", "errors": [str(e)]}
