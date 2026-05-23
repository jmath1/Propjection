from decimal import Decimal
from typing import List, Dict


class VerdictMixin:
    """Calculates scenario generation and final investment verdict metrics."""

    def _verdict_metric(self, value: Decimal, benchmark: float, pass_condition: bool, description: str) -> Dict:
        """Create a verdict metric entry."""
        return {
            'value': float(value),
            'benchmark': benchmark,
            'pass': pass_condition,
            'description': description,
        }

    def _calc_one_percent_rule(self, gross_annual_rent: Decimal, purchase_price: Decimal) -> Decimal:
        """Calculate one percent rule: monthly gross rent / price."""
        if purchase_price > 0:
            return (gross_annual_rent / 12) / purchase_price
        return Decimal('0')

    def _calc_grm(self, purchase_price: Decimal, gross_annual_rent: Decimal) -> Decimal:
        """Calculate gross rent multiplier."""
        if gross_annual_rent > 0:
            return purchase_price / gross_annual_rent
        return Decimal('999')

    def _calc_coc_return(self, cash_flow: Decimal, total_cash_to_close: Decimal) -> Decimal:
        """Calculate cash-on-cash return."""
        if total_cash_to_close > 0:
            return cash_flow / total_cash_to_close
        return Decimal('0')

    def _calc_break_even_year(self, cashflow_schedule: List[Dict]) -> int:
        """Find the first year where cumulative cash flow becomes non-negative."""
        for i, item in enumerate(cashflow_schedule):
            if item['cumulative_cash_flow'] >= 0:
                return i + 1
        return self.p.analysis_horizon_years

    def _calc_moic(self, final_cumulative_cf: Decimal, total_cash_to_close: Decimal) -> Decimal:
        """Calculate multiple on invested capital (MOIC)."""
        if total_cash_to_close > 0:
            return (final_cumulative_cf + total_cash_to_close) / total_cash_to_close
        return Decimal('1')

    def _calc_implied_irr(self, final_cumulative_cf: Decimal, total_cash_to_close: Decimal, years: int) -> Decimal:
        """Calculate approximate IRR."""
        if total_cash_to_close <= 0 or final_cumulative_cf <= 0:
            return Decimal('0')
        return (final_cumulative_cf / total_cash_to_close) ** (1 / Decimal(years)) - 1

    def _calculate_scenarios(self, derived: Dict, base_case: Dict) -> Dict:
        """Calculate Bull / Base / Bear scenarios."""
        return {
            'bull': {
                'appreciation': float(base_case['appreciation'] + float(self.p.scenario_appreciation_delta)),
                'rent_growth': float(base_case['rent_growth'] + float(self.p.scenario_rent_growth_delta)),
                'vacancy': max(0, float(base_case['vacancy'] - float(self.p.scenario_vacancy_delta))),
                'expense_inflation': float(base_case['expense_inflation'] - float(self.p.scenario_expense_inflation_delta)),
            },
            'base': base_case,
            'bear': {
                'appreciation': max(0, float(base_case['appreciation'] - float(self.p.scenario_appreciation_delta))),
                'rent_growth': max(0, float(base_case['rent_growth'] - float(self.p.scenario_rent_growth_delta))),
                'vacancy': float(base_case['vacancy'] + float(self.p.scenario_vacancy_delta)),
                'expense_inflation': float(base_case['expense_inflation'] + float(self.p.scenario_expense_inflation_delta)),
            },
        }

    def _calculate_verdict(self, derived: Dict, income_schedule: List[Dict],
                           mortgage_schedule: List[Dict], cashflow_schedule: List[Dict]) -> Dict:
        """Calculate deal verdict metrics."""
        purchase_price = derived['purchase_price']
        total_cash_to_close = derived['total_cash_to_close']

        # Extract key year values
        year1_income = Decimal(str(income_schedule[0]['gross_annual_rent']))
        year1_noi = Decimal(str(cashflow_schedule[0]['noi']))
        year1_cf = Decimal(str(cashflow_schedule[0]['annual_cash_flow']))

        year3_noi = Decimal(str(cashflow_schedule[2]['noi'])) if len(cashflow_schedule) > 2 else Decimal('0')
        year3_cf = Decimal(str(cashflow_schedule[2]['annual_cash_flow'])) if len(cashflow_schedule) > 2 else Decimal('0')
        year3_dscr = Decimal(str(cashflow_schedule[2]['dscr'])) if len(cashflow_schedule) > 2 else Decimal('0')

        final_cf = Decimal(str(cashflow_schedule[-1]['cumulative_cash_flow']))

        # Calculate individual metrics
        one_percent_rule = self._calc_one_percent_rule(year1_income, purchase_price)
        grm = self._calc_grm(purchase_price, year1_income)
        cap_rate_yr1 = self._calc_cap_rate(year1_noi, purchase_price)
        coc_yr1 = self._calc_coc_return(year1_cf, total_cash_to_close)
        coc_yr3 = self._calc_coc_return(year3_cf, total_cash_to_close)
        break_even_year = self._calc_break_even_year(cashflow_schedule)
        total_moic = self._calc_moic(final_cf, total_cash_to_close)
        implied_irr = self._calc_implied_irr(final_cf, total_cash_to_close, self.p.analysis_horizon_years)

        return {
            'one_percent_rule': self._verdict_metric(
                one_percent_rule, 0.01,
                float(one_percent_rule) >= 0.01,
                'Monthly Rent / Price ≥ 1%'
            ),
            'grm': self._verdict_metric(
                grm, 10.0,
                float(grm) <= 10.0,
                'Gross Rent Multiplier ≤ 10x'
            ),
            'cap_rate_yr1': self._verdict_metric(
                cap_rate_yr1, 0.06,
                float(cap_rate_yr1) >= 0.06,
                'Yr 1 Cap Rate ≥ 6%'
            ),
            'coc_yr1': self._verdict_metric(
                coc_yr1, 0.0,
                float(coc_yr1) >= 0.0,
                'Yr 1 Cash-on-Cash ≥ 0%'
            ),
            'coc_yr3': self._verdict_metric(
                coc_yr3, 0.04,
                float(coc_yr3) >= 0.04,
                'Yr 3 Cash-on-Cash ≥ 4%'
            ),
            'dscr_yr3': self._verdict_metric(
                year3_dscr, 1.25,
                float(year3_dscr) >= 1.25,
                'Yr 3 DSCR ≥ 1.25x'
            ),
            'break_even_year': self._verdict_metric(
                Decimal(break_even_year), 10,
                break_even_year <= 10,
                'Break-even ≤ 10 years'
            ),
            'total_moic': self._verdict_metric(
                total_moic, 3.0,
                float(total_moic) >= 3.0,
                'Total MOIC ≥ 3x'
            ),
            'implied_irr': self._verdict_metric(
                implied_irr, 0.10,
                float(implied_irr) >= 0.10,
                'Implied IRR ≥ 10%'
            ),
        }
