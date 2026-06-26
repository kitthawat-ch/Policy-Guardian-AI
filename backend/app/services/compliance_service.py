class ComplianceService:
    def __init__(self):
        pass

    def validate_expense(self, employee_id: str, expense_type: str, amount: float, currency: str, description: str):
        """
        Hardcoded business rules for standard compliance evaluation.
        """
        if amount <= 0:
            return {"status": "AUTO_DENIED", "reason": "Amount must be greater than 0.", "triggered_rules": ["INVALID_AMOUNT"]}

        if expense_type.upper() == "MEALS":
            if amount > 150:
                return {"status": "REQUIRES_REVIEW", "reason": "Amount exceeds $150 limit for MEALS.", "triggered_rules": ["MEAL_LIMIT_EXCEEDED"]}
            return {"status": "AUTO_APPROVED", "reason": "Within standard limits.", "triggered_rules": []}
            
        elif expense_type.upper() == "EQUIPMENT":
            if amount > 500:
                return {"status": "REQUIRES_REVIEW", "reason": "Amount exceeds $500 limit for EQUIPMENT.", "triggered_rules": ["EQUIP_LIMIT_EXCEEDED"]}
            return {"status": "AUTO_APPROVED", "reason": "Within standard limits.", "triggered_rules": []}

        # Fallback for unknown types
        return {"status": "REQUIRES_REVIEW", "reason": "Unknown expense category requires manual review.", "triggered_rules": ["UNKNOWN_CATEGORY"]}
