from decimal import Decimal, ROUND_HALF_UP
import math
from typing import List, Dict, Any, Tuple


class ProjectionCalculator:
    def __init__(self, projection, units: List):
        """
        projection: Projection model instance
        units: List of RentalUnit model instances (sorted by order)
        """
        self.p = projection
        self.units = sorted(units, key=lambda u: u.order)

    def calculate(self) -> Dict[str, Any]:
        """Run all calculations and return comprehensive projection data."""
        derived = self._derive_inputs()
        income_schedule = self._calculate_income_schedule(derived)
        mortgage_schedule = self._calculate_mortgage_schedule(derived)
        expense_schedule = self._calculate_expense_schedule(derived, mortgage_schedule)
        equity_schedule = self._calculate_equity_schedule(derived, income_schedule, expense_schedule, mortgage_schedule)
        cashflow_schedule = self._calculate_cashflow_schedule(income_schedule, expense_schedule, mortgage_schedule, equity_schedule)

        base_case = {
            'appreciation': float(self.p.annual_appreciation_pct),
            'rent_growth': float(self.p.annual_rent_growth_pct),
            'vacancy': float(self.p.vacancy_rate_pct),
            'expense_inflation': float(self.p.expense_inflation_pct),
        }

        scenarios = self._calculate_scenarios(derived, base_case)
        verdict = self._calculate_verdict(derived, income_schedule, mortgage_schedule, cashflow_schedule)
        tax_forecast = self._calculate_tax_forecast(derived, income_schedule, mortgage_schedule, expense_schedule)

        return {
            'derived': derived,
            'income_schedule': income_schedule,
            'expense_schedule': expense_schedule,
            'mortgage_schedule': mortgage_schedule,
            'equity_schedule': equity_schedule,
            'cashflow_schedule': cashflow_schedule,
            'base_case': base_case,
            'scenarios': scenarios,
            'verdict': verdict,
            'tax_forecast': tax_forecast,
        }

    # ==================== CALCULATION HELPERS ====================

    def _calc_monthly_payment(self, loan_amount: Decimal, annual_rate: Decimal, term_years: int) -> Decimal:
        """Calculate monthly mortgage payment using standard formula: P*[r(1+r)^n]/[(1+r)^n-1]"""
        monthly_rate = annual_rate / Decimal(12)
        months = term_years * 12
        if monthly_rate > 0:
            factor = (1 + monthly_rate) ** months
            return loan_amount * (monthly_rate * factor) / (factor - 1)
        else:
            return loan_amount / months

    def _calc_acquisition_costs(self) -> Tuple[Decimal, Decimal]:
        """Calculate transfer tax and total acquisition costs."""
        purchase_price = Decimal(str(self.p.purchase_price))
        transfer_tax_pct = Decimal(str(self.p.transfer_tax_pct))
        transfer_tax = purchase_price * transfer_tax_pct
        total_acq_costs = (
            transfer_tax +
            Decimal(str(self.p.lender_fees)) +
            Decimal(str(self.p.title_insurance)) +
            Decimal(str(self.p.inspection_appraisal)) +
            Decimal(str(self.p.attorney_fees)) +
            Decimal(str(self.p.other_closing_costs))
        )
        return transfer_tax, total_acq_costs

    def _calc_pmi(self, loan_amount: Decimal) -> Tuple[Decimal, Decimal]:
        """Calculate monthly and annual PMI."""
        pmi_rate = Decimal(str(self.p.pmi_rate))
        pmi_monthly = loan_amount * pmi_rate / Decimal(12)
        pmi_annual = pmi_monthly * Decimal(12)
        return pmi_monthly, pmi_annual

    def _calc_rent_growth_factor(self, year_num: int) -> Decimal:
        """Calculate rent growth multiplier for a given year."""
        annual_rent_growth = Decimal(str(self.p.annual_rent_growth_pct))
        return (1 + annual_rent_growth) ** (year_num - 1)

    def _calc_unit_rent(self, unit, year_num: int, rent_growth_factor: Decimal) -> Decimal:
        """Calculate rent for a single unit, accounting for owner-occupied years."""
        if year_num <= unit.owner_occupied_years:
            return Decimal('0')
        monthly_rent = Decimal(str(unit.monthly_rent))
        return monthly_rent * rent_growth_factor

    def _calc_vacancy_loss(self, gross_annual_rent: Decimal) -> Decimal:
        """Calculate annual vacancy loss."""
        vacancy_rate = Decimal(str(self.p.vacancy_rate_pct))
        return gross_annual_rent * vacancy_rate

    def _calc_mgmt_fee(self, gross_annual_rent: Decimal, vacancy_loss: Decimal) -> Decimal:
        """Calculate property management fee on effective rent."""
        property_mgmt_pct = Decimal(str(self.p.property_mgmt_pct))
        return (gross_annual_rent - vacancy_loss) * property_mgmt_pct

    def _calc_home_value(self, year_num: int) -> Decimal:
        """Calculate home value after appreciation."""
        purchase_price = Decimal(str(self.p.purchase_price))
        annual_appreciation = Decimal(str(self.p.annual_appreciation_pct))
        return purchase_price * (1 + annual_appreciation) ** (year_num - 1)

    def _calc_expense_inflation_factor(self, year_num: int) -> Decimal:
        """Calculate expense inflation multiplier for a given year."""
        expense_inflation = Decimal(str(self.p.expense_inflation_pct))
        return (1 + expense_inflation) ** (year_num - 1)

    def _amortize_year(self, balance: Decimal, monthly_rate: Decimal, monthly_payment: Decimal, monthly_prepayment: Decimal = Decimal('0')) -> Tuple[Decimal, Decimal, Decimal]:
        """Amortize one year of mortgage payments. Returns (ending_balance, annual_interest, annual_principal)."""
        annual_interest = Decimal('0')
        annual_principal = Decimal('0')
        for month in range(12):
            if balance <= 0:
                break
            interest_payment = balance * monthly_rate
            principal_payment = monthly_payment - interest_payment
            total_principal_payment = principal_payment + monthly_prepayment
            balance -= total_principal_payment
            annual_interest += interest_payment
            annual_principal += total_principal_payment
        balance = max(balance, Decimal('0'))
        return balance, annual_interest, annual_principal

    def _calc_pmi_for_year(self, balance: Decimal, loan_amount: Decimal) -> Decimal:
        """Calculate PMI for a year, accounting for LTV-based drop-off (PMI drops at 80% LTV)."""
        pmi_rate = Decimal(str(self.p.pmi_rate))
        pmi = pmi_rate * loan_amount / Decimal(12) * Decimal(12)
        if balance > 0:
            ltv = balance / loan_amount
            if ltv <= Decimal('0.80'):
                return Decimal('0')
        else:
            return Decimal('0')
        return pmi

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
            selling_costs_pct = Decimal(str(self.p.selling_costs_pct))
            selling_costs = home_value * selling_costs_pct
            net_proceeds = home_value - loan_balance - selling_costs
            return net_proceeds, net_proceeds
        return Decimal('0'), Decimal('0')

    def _calc_dscr(self, noi: Decimal, debt_service: Decimal) -> Decimal:
        """Calculate debt service coverage ratio."""
        if debt_service > 0:
            return noi / debt_service
        return Decimal('0')

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

    # ==================== MAIN CALCULATION METHODS ====================

    def _derive_inputs(self) -> Dict[str, Decimal]:
        """Calculate derived inputs from assumptions."""
        # Convert all inputs to Decimal to ensure consistent arithmetic
        purchase_price = Decimal(str(self.p.purchase_price))
        down_payment_pct = Decimal(str(self.p.down_payment_pct))
        down_payment = purchase_price * down_payment_pct

        transfer_tax, total_acq_costs = self._calc_acquisition_costs()
        total_cash_to_close = down_payment + total_acq_costs

        loan_amount = purchase_price - down_payment
        interest_rate = Decimal(str(self.p.interest_rate))
        monthly_payment = self._calc_monthly_payment(loan_amount, interest_rate, self.p.term_years)
        annual_payment = monthly_payment * Decimal(12)

        pmi_monthly, pmi_annual = self._calc_pmi(loan_amount)
        monthly_rate = interest_rate / Decimal(12)

        derived = {
            'purchase_price': purchase_price,
            'down_payment': down_payment,
            'down_payment_pct': down_payment_pct,
            'transfer_tax': transfer_tax,
            'total_acq_costs': total_acq_costs,
            'total_cash_to_close': total_cash_to_close,
            'loan_amount': loan_amount,
            'monthly_payment': monthly_payment,
            'annual_payment': annual_payment,
            'pmi_monthly': pmi_monthly,
            'pmi_annual': pmi_annual,
            'monthly_rate': monthly_rate,
        }

        # Handle refinancing if configured
        refi_year = int(getattr(self.p, 'refinance_year', 0) or 0)
        refi_rate = Decimal(str(self.p.refinance_rate)) if getattr(self.p, 'refinance_rate', None) else None
        monthly_prepayment = Decimal(str(self.p.monthly_prepayment)) if hasattr(self.p, 'monthly_prepayment') else Decimal('0')

        if refi_year > 0 and refi_rate and refi_rate > 0:
            # Simulate amortization to find balance just before refi year
            refi_balance = loan_amount
            refi_mr = interest_rate / Decimal(12)
            for _ in range(refi_year - 1):
                refi_balance, _, _ = self._amortize_year(refi_balance, refi_mr, monthly_payment, monthly_prepayment)
            remaining_term = max(self.p.term_years - (refi_year - 1), 1)
            refi_mp = self._calc_monthly_payment(refi_balance, refi_rate, remaining_term)
            derived.update({
                'has_refinance': True,
                'refinance_year': refi_year,
                'refinance_monthly_rate': refi_rate / Decimal(12),
                'refinance_monthly_payment': refi_mp,
                'refinance_annual_payment': refi_mp * Decimal(12),
            })
        else:
            derived['has_refinance'] = False

        return derived

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

    def _calculate_expense_schedule(self, derived: Dict, mortgage_schedule: List[Dict]) -> List[Dict]:
        """Calculate yearly operating expense schedule."""
        schedule = []

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            year = self.p.purchase_year + year_num - 1

            home_value = self._calc_home_value(year_num)
            expense_inflation_factor = self._calc_expense_inflation_factor(year_num)

            property_tax_pct = Decimal(str(self.p.property_tax_pct))
            insurance_annual = Decimal(str(self.p.insurance_annual))
            hoa_annual = Decimal(str(self.p.hoa_annual))
            maintenance_pct = Decimal(str(self.p.maintenance_pct))
            utilities_annual = Decimal(str(self.p.utilities_annual))

            property_tax = home_value * property_tax_pct
            insurance = insurance_annual * expense_inflation_factor
            hoa = hoa_annual * expense_inflation_factor
            maintenance = home_value * maintenance_pct
            utilities = utilities_annual * expense_inflation_factor

            total_operating = property_tax + insurance + hoa + maintenance + utilities

            # Get debt service from mortgage schedule to ensure consistency
            mortgage_row = mortgage_schedule[year_num - 1]
            annual_payment = Decimal(str(mortgage_row['annual_payment']))
            pmi = Decimal(str(mortgage_row['pmi']))
            # Once loan is paid off (balance = 0), debt service is $0
            ending_balance = Decimal(str(mortgage_row['ending_balance']))
            debt_service = (annual_payment + pmi) if ending_balance > 0 else Decimal('0')
            all_in_cost = debt_service + Decimal(str(total_operating))

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

    def _calculate_mortgage_schedule(self, derived: Dict) -> List[Dict]:
        """Calculate mortgage amortization schedule."""
        schedule = []
        balance = derived['loan_amount']
        monthly_rate = derived['monthly_rate']
        monthly_payment = derived['monthly_payment']
        monthly_prepayment = Decimal(str(self.p.monthly_prepayment)) if hasattr(self.p, 'monthly_prepayment') else Decimal('0')
        cumulative_interest = Decimal('0')
        loan_amount = derived['loan_amount']
        loan_paid_off = False

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            # Switch to refinanced rate/payment if we hit the refinance year
            if derived.get('has_refinance') and year_num == derived['refinance_year'] and not loan_paid_off:
                monthly_rate = derived['refinance_monthly_rate']
                monthly_payment = derived['refinance_monthly_payment']

            beginning_balance = balance

            # If loan is already paid off, no more payments
            if loan_paid_off or balance <= Decimal('0'):
                loan_paid_off = True
                annual_interest = Decimal('0')
                annual_principal = Decimal('0')
                annual_payment = Decimal('0')
                balance = Decimal('0')
                pmi = Decimal('0')
            else:
                balance, annual_interest, annual_principal = self._amortize_year(balance, monthly_rate, monthly_payment, monthly_prepayment)
                cumulative_interest += annual_interest
                annual_payment = monthly_payment * Decimal(12)
                pmi = self._calc_pmi_for_year(balance, loan_amount)

            refinanced = derived.get('has_refinance') and year_num >= derived.get('refinance_year', 0)

            schedule.append({
                'year_num': year_num,
                'calendar_year': self.p.purchase_year + year_num - 1,
                'beginning_balance': float(beginning_balance),
                'annual_payment': float(annual_payment),
                'interest_paid': float(annual_interest),
                'principal_paid': float(annual_principal),
                'ending_balance': float(max(balance, Decimal('0'))),
                'cumulative_interest': float(cumulative_interest),
                'pmi': float(pmi),
                'refinanced': refinanced,
            })

        return schedule

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

    def _calculate_cashflow_schedule(self, income_schedule: List[Dict], expense_schedule: List[Dict],
                                      mortgage_schedule: List[Dict], equity_schedule: List[Dict]) -> List[Dict]:
        """Calculate cash flow statement."""
        schedule = []
        cumulative_cf = Decimal('0')

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            income = Decimal(str(income_schedule[year_num - 1]['effective_rental_income']))
            operating_expenses = Decimal(str(expense_schedule[year_num - 1]['total_operating']))
            # Use debt service from mortgage schedule to account for early payoff from prepayments
            mortgage_row = mortgage_schedule[year_num - 1]
            annual_payment = Decimal(str(mortgage_row['annual_payment']))
            pmi = Decimal(str(mortgage_row['pmi']))
            # Once loan is paid off (balance = 0), debt service is $0
            ending_balance = Decimal(str(mortgage_row['ending_balance']))
            debt_service = (annual_payment + pmi) if ending_balance > 0 else Decimal('0')

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

    def _calculate_tax_forecast(self, derived: Dict, income_schedule: List[Dict], mortgage_schedule: List[Dict], expense_schedule: List[Dict]) -> List[Dict]:
        """Calculate estimated tax liability based on rental income and deductions."""
        tax_forecast = []

        for year_num in range(self.p.analysis_horizon_years):
            inc_data = income_schedule[year_num] if year_num < len(income_schedule) else {}
            mort_data = mortgage_schedule[year_num] if year_num < len(mortgage_schedule) else {}
            exp_data = expense_schedule[year_num] if year_num < len(expense_schedule) else {}

            gross_rental_income = Decimal(str(inc_data.get('gross_annual_rent', 0)))
            mortgage_interest = Decimal(str(mort_data.get('interest_paid', 0)))
            property_tax = Decimal(str(exp_data.get('property_tax', 0)))
            repairs = Decimal(str(getattr(self.p, 'repairs_annual', 0)))
            insurance = Decimal(str(self.p.insurance_annual))
            utilities = Decimal(str(self.p.utilities_annual))

            total_deductions = mortgage_interest + property_tax + repairs + insurance + utilities
            taxable_income = gross_rental_income - total_deductions

            estimated_tax = max(taxable_income * Decimal('0.25'), Decimal(0))

            tax_forecast.append({
                'year': year_num + 1,
                'gross_rental_income': float(gross_rental_income),
                'mortgage_interest_deduction': float(mortgage_interest),
                'property_tax_deduction': float(property_tax),
                'repairs_deduction': float(repairs),
                'insurance_deduction': float(insurance),
                'utilities_deduction': float(utilities),
                'total_deductions': float(total_deductions),
                'taxable_income': float(taxable_income),
                'estimated_tax_liability': float(estimated_tax),
            })

        return tax_forecast
