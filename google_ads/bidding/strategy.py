from typing import Tuple, List

class BiddingStrategyValidator:
    """
    Validates bidding strategy configurations against Google Ads API standards.
    """

    ALLOWED_STRATEGIES = {"MANUAL_CPC", "MAXIMIZE_CLICKS", "MAXIMIZE_CONVERSIONS", "TARGET_CPA"}

    @classmethod
    def validate(cls, strategy: str, daily_budget: float) -> Tuple[bool, List[str]]:
        """
        Validates strategy name and budget sufficiency.
        """
        errors = []
        strat_upper = strategy.upper().strip()

        if strat_upper not in cls.ALLOWED_STRATEGIES:
            errors.append(f"Unsupported bidding strategy '{strategy}'. Must be one of {cls.ALLOWED_STRATEGIES}.")

        if strat_upper == "TARGET_CPA" and daily_budget < 300.0:
            errors.append("TARGET_CPA strategy recommends a daily budget of at least ₹300/day to allow algorithm learning.")

        return (len(errors) == 0, errors)
