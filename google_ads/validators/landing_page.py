import urllib.request
import urllib.parse
import re
from typing import Dict, Any, List, Tuple

class LandingPageValidator:
    """
    Validates landing page URL syntax, HTTPS security, reachability, and relevance.
    """

    @classmethod
    def validate_url(
        cls,
        url: str,
        service: str = "",
        location: str = ""
    ) -> Tuple[bool, List[str]]:
        """
        Validates URL accessibility and keyword/service alignment.
        """
        warnings: List[str] = []

        if not url or not (url.startswith("http://") or url.startswith("https://")):
            return False, ["Landing page URL is invalid or missing scheme (must start with http:// or https://)."]

        if not url.startswith("https://"):
            warnings.append("Landing page does not use HTTPS protocol (recommended for conversion tracking and Trust).")

        # Reachability test
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Google-Ads-Campaign-Compiler/1.0"},
                method="GET"
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                status = resp.status
                if status >= 400:
                    return False, [f"Landing page returned HTTP error status code {status}."]

                content_type = resp.headers.get("Content-Type", "")
                if "text/html" in content_type:
                    html_snippet = resp.read(8000).decode("utf-8", errors="ignore").lower()
                    
                    # Relevance checks
                    service_words = [w for w in re.split(r"\W+", service.lower()) if len(w) > 2]
                    loc_words = [w for w in re.split(r"\W+", location.lower()) if len(w) > 2]

                    matched_service = sum(1 for w in service_words if w in html_snippet)
                    if service_words and matched_service == 0:
                        warnings.append(f"HIGH RISK: Landing page content may lack service keywords for '{service}'.")

                    matched_loc = sum(1 for w in loc_words if w in html_snippet)
                    if loc_words and matched_loc == 0:
                        warnings.append(f"MEDIUM RISK: Landing page content does not mention location '{location}'.")

        except Exception as e:
            warnings.append(f"Landing page network inspection warning: Could not fetch URL ({e}).")

        return True, warnings
