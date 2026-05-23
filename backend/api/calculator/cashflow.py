from decimal import Decimal
from typing import List, Dict


class CashflowScheduleMixin:
    """Calculates cash flow statement with DSCR tracking."""

    def _calc_dscr(self, noi: Decimal, debt_service: Decimal) -> Decimal:
        """Calculate debt service coverage ratio."""
        if debt_service > 0:
            return noi / debt_service
        return Decimal('0')

    def _calculate_cashflow_schedule(self, income_schedule: List[Dict], expense_schedule: List[Dict],
                                      mortgage_schedule: List[Dict], equity_schedule: List[Dict]) -> List[Dict]:
        """Calculate cash flow statement."""
        schedule = []
        cumulative_cf = Decimal('0')

        for year_num in range(1, len(income_schedule) + 1):
            income = Decimal(str(income_schedule[year_num - 1]['effective_rental_income']))
            operating_expenses = Decimal(str(expense_schedule[year_num - 1]['total_operating']))
            debt_service = Decimal(str(expense_schedule[year_num - 1]['debt_service']))

            noi = self._calc_noi(income, operating_expenses)
            annual_cf = noi - debt_service
            monthly_cf = annual_cf / Decimal(12)
            cumulative_cf += annual_cf

            dscr = self._calc_dscr(noi, debt_service)
            coc_return = Decimal('0')

            schedule.append({
                'year_num': year_num,
                'calendar_year': self.p.purchase_year + year_num - 1,
                'effective_rental_income': float(income),
                'operating_expenses': float(operating_expenses),
                'noi': float(noi),
                'debt_service': float(debt_service),
                'annual_cash_flow': float(annual_cf),
                'monthly_cash_flow': float(monthly_cf),
                'dscr': float(dscr),
                'cash_on_cash_return': float(coc_return),
                'cumulative_cash_flow': float(cumulative_cf),
            })

        return schedule
