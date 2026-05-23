from decimal import Decimal
from typing import List, Dict


class IncomeScheduleMixin:
    """Calculates rental income schedules accounting for growth, vacancy, and owner-occupation."""

    def _calc_rent_growth_factor(self, year_num: int) -> Decimal:
        """Calculate rent growth multiplier for a given year."""
        return (1 + self.p.annual_rent_growth_pct) ** (year_num - 1)

    def _calc_unit_rent(self, unit, year_num: int, rent_growth_factor: Decimal) -> Decimal:
        """Calculate rent for a single unit, accounting for owner-occupied years."""
        if year_num <= unit.owner_occupied_years:
            return Decimal('0')
        return unit.monthly_rent * rent_growth_factor

    def _calc_vacancy_loss(self, gross_annual_rent: Decimal) -> Decimal:
        """Calculate annual vacancy loss."""
        return gross_annual_rent * self.p.vacancy_rate_pct

    def _calc_mgmt_fee(self, gross_annual_rent: Decimal, vacancy_loss: Decimal) -> Decimal:
        """Calculate property management fee on effective rent."""
        return (gross_annual_rent - vacancy_loss) * self.p.property_mgmt_pct

    def _calculate_income_schedule(self, derived: Dict) -> List[Dict]:
        """Calculate yearly rental income schedule."""
        schedule = []

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            year = self.p.purchase_year + year_num - 1

            rent_growth_factor = self._calc_rent_growth_factor(year_num)

            unit_rents = []
            total_monthly_rent = Decimal('0')

            for unit in self.units:
                unit_rent = self._calc_unit_rent(unit, year_num, rent_growth_factor)
                unit_rents.append(unit_rent)
                total_monthly_rent += unit_rent

            gross_annual_rent = total_monthly_rent * Decimal(12)
            vacancy_loss = self._calc_vacancy_loss(gross_annual_rent)
            property_mgmt_fee = self._calc_mgmt_fee(gross_annual_rent, vacancy_loss)
            effective_rental_income = gross_annual_rent - vacancy_loss - property_mgmt_fee

            schedule.append({
                'year_num': year_num,
                'calendar_year': year,
                'unit_rents': [float(r) for r in unit_rents],
                'total_monthly_rent': float(total_monthly_rent),
                'gross_annual_rent': float(gross_annual_rent),
                'vacancy_loss': float(vacancy_loss),
                'property_mgmt_fee': float(property_mgmt_fee),
                'effective_rental_income': float(effective_rental_income),
            })

        return schedule
