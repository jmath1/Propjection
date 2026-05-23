from decimal import Decimal
from typing import List, Dict


class ExpenseScheduleMixin:
    """Calculates operating expenses inflating over time against an appreciating asset."""

    def _calc_home_value(self, year_num: int) -> Decimal:
        """Calculate home value after appreciation."""
        purchase_price = self.p.purchase_price
        return purchase_price * (1 + self.p.annual_appreciation_pct) ** (year_num - 1)

    def _calc_expense_inflation_factor(self, year_num: int) -> Decimal:
        """Calculate expense inflation multiplier for a given year."""
        return (1 + self.p.expense_inflation_pct) ** (year_num - 1)

    def _calculate_expense_schedule(self, derived: Dict) -> List[Dict]:
        """Calculate yearly operating expense schedule."""
        schedule = []

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            year = self.p.purchase_year + year_num - 1

            home_value = self._calc_home_value(year_num)
            expense_inflation_factor = self._calc_expense_inflation_factor(year_num)

            property_tax = home_value * self.p.property_tax_pct
            insurance = self.p.insurance_annual * expense_inflation_factor
            hoa = self.p.hoa_annual * expense_inflation_factor
            maintenance = home_value * self.p.maintenance_pct
            utilities = self.p.utilities_annual * expense_inflation_factor

            total_operating = property_tax + insurance + hoa + maintenance + utilities

            pmi = derived['pmi_annual']
            debt_service = derived['annual_payment'] + pmi
            all_in_cost = debt_service + total_operating

            schedule.append({
                'year_num': year_num,
                'calendar_year': year,
                'property_tax': float(property_tax),
                'insurance': float(insurance),
                'hoa': float(hoa),
                'maintenance': float(maintenance),
                'utilities': float(utilities),
                'total_operating': float(total_operating),
                'debt_service': float(debt_service),
                'all_in_cost': float(all_in_cost),
            })

        return schedule
