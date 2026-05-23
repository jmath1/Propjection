from decimal import Decimal
from typing import List, Dict, Tuple


class EquityScheduleMixin:
    """Calculates equity accumulation, cap rates, and conditional sale proceeds."""

    def _calc_noi(self, income: Decimal, operating_expenses: Decimal) -> Decimal:
        """Calculate net operating income."""
        return income - operating_expenses

    def _calc_cap_rate(self, noi: Decimal, purchase_price: Decimal) -> Decimal:
        """Calculate cap rate (NOI / purchase price)."""
        if purchase_price > 0:
            return noi / purchase_price
        return Decimal('0')

    def _calc_sale_proceeds(self, home_value: Decimal, loan_balance: Decimal, year_num: int) -> Tuple[Decimal, Decimal]:
        """Calculate net proceeds and total return if property is sold this year."""
        if self.p.sale_year == year_num and self.p.sale_year > 0:
            selling_costs = home_value * self.p.selling_costs_pct
            net_proceeds = home_value - loan_balance - selling_costs
            return net_proceeds, net_proceeds
        return Decimal('0'), Decimal('0')

    def _calculate_equity_schedule(self, derived: Dict, income_schedule: List[Dict],
                                   expense_schedule: List[Dict], mortgage_schedule: List[Dict]) -> List[Dict]:
        """Calculate yearly equity and returns."""
        schedule = []
        cumulative_cf = Decimal('0')

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            income = Decimal(str(income_schedule[year_num - 1]['effective_rental_income']))
            operating_expenses = Decimal(str(expense_schedule[year_num - 1]['total_operating']))
            debt_service = Decimal(str(expense_schedule[year_num - 1]['debt_service']))

            noi = self._calc_noi(income, operating_expenses)
            home_value = self._calc_home_value(year_num)
            loan_balance = Decimal(str(mortgage_schedule[year_num - 1]['ending_balance']))
            gross_equity = home_value - loan_balance

            annual_cf = income - operating_expenses - debt_service
            cumulative_cf += annual_cf

            cap_rate = self._calc_cap_rate(noi, derived['purchase_price'])
            net_proceeds, total_return = self._calc_sale_proceeds(home_value, loan_balance, year_num)
            total_return = total_return + cumulative_cf if total_return > 0 else Decimal('0')

            schedule.append({
                'year_num': year_num,
                'calendar_year': self.p.purchase_year + year_num - 1,
                'home_value': float(home_value),
                'loan_balance': float(loan_balance),
                'gross_equity': float(gross_equity),
                'rental_income': float(income),
                'operating_expenses': float(operating_expenses),
                'noi': float(noi),
                'cap_rate': float(cap_rate),
                'annual_cash_flow': float(annual_cf),
                'cumulative_cash_flow': float(cumulative_cf),
                'net_proceeds_if_sold': float(net_proceeds),
                'total_return_if_sold': float(total_return),
            })

        return schedule
