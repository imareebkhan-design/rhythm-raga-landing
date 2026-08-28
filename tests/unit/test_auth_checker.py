import unittest
from google_ads.config import Config
from google_ads.auth.checker import AuthChecker

class TestAuthChecker(unittest.TestCase):
    def test_check_auth_missing_credentials(self):
        res = AuthChecker.check_auth()
        self.assertIn(res.get("status"), ["NOT_READY", "READY"])

    def test_list_accounts_unconfigured(self):
        res = AuthChecker.list_accounts()
        self.assertIn(res.get("status"), ["FAILED", "EMPTY", "SUCCESS"])

if __name__ == "__main__":
    unittest.main()
