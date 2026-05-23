from decimal import Decimal
from typing import List, Dict, Tuple


class MortgageScheduleMixin:
    """Calculates year-by-year mortgage amortization and PMI tracking."""

    def _amortize_year(self, balance: Decimal, monthly_rate: Decimal, monthly_payment: Decimal) -> Tuple[Decimal, Decimal, Decimal]:
        """Amortize one year of mortgage payments. Returns (ending_balance, annual_interest, annual_principal)."""
        annual_interest = Decimal('0')
        annual_principal = Decimal('0')
        for month in range(12):
            if balance <= 0:
                break
            interest_payment = balance * monthly_rate
            principal_payment = monthly_payment - interest_payment
            balance -= principal_payment
            annual_interest += interest_payment
            annual_principal += principal_payment
        balance = max(balance, Decimal('0'))
        return balance, annual_interest, annual_principal

    def _calc_pmi_for_year(self, balance: Decimal, loan_amount: Decimal) -> Decimal:
        """Calculate PMI for a year, accounting for LTV-based drop-off (PMI drops at 80% LTV)."""
        pmi = self.p.pmi_rate * loan_amount / Decimal(12) * Decimal(12)
        if balance > 0:
            ltv = balance / loan_amount
            if ltv <= Decimal('0.80'):
                return Decimal('0')
        else:
            return Decimal('0')
        return pmi

    def _calculate_mortgage_schedule(self, derived: Dict) -> List[Dict]:
        """Calculate mortgage amortization schedule."""
        schedule = []
        balance = derived['loan_amount']
        monthly_rate = derived['monthly_rate']
        monthly_payment = derived['monthly_payment']
        cumulative_interest = Decimal('0')
        loan_amount = derived['loan_amount']

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            beginning_balance = balance

            balance, annual_interest, annual_principal = self._amortize_year(balance, monthly_rate, monthly_payment)
            cumulative_interest += annual_interest

            pmi = self._calc_pmi_for_year(balance, loan_amount)

            schedule.append({
                'year_num': year_num,
                'calendar_year': self.p.purchase_year + year_num - 1,
                'beginning_balance': float(beginning_balance),
                'annual_payment': float(monthly_payment * Decimal(12)),
                'interest_paid': float(annual_interest),
                'principal_paid': float(annual_principal),
                'ending_balance': float(balance),
                'cumulative_interest': float(cumulative_interest),
                'pmi': float(pmi),
            })

        return schedule
