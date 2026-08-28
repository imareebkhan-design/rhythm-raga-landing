from typing import Dict, Tuple
from google_ads.config import Config

class LanguageResolver:
    """
    Resolves human-readable language names to official Google Ads LanguageConstant IDs.
    """

    KNOWN_LANGUAGES: Dict[str, Tuple[str, str]] = {
        "english": ("1000", "English"),
        "en": ("1000", "English"),
        "hindi": ("1023", "Hindi"),
        "hi": ("1023", "Hindi"),
        "spanish": ("1003", "Spanish"),
        "french": ("1002", "French"),
        "german": ("1001", "German")
    }

    @classmethod
    def resolve_language(cls, language_name: str) -> Tuple[str, str]:
        """
        Returns (language_constant_id, canonical_name).
        """
        clean = language_name.strip().lower()
        if clean in cls.KNOWN_LANGUAGES:
            return cls.KNOWN_LANGUAGES[clean]

        return Config.DEFAULT_LANGUAGE, "English"
