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
        expense_schedule = self._calculate_expense_schedule(derived)
        mortgage_schedule = self._calculate_mortgage_schedule(derived)
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
        }

    def _derive_inputs(self) -> Dict[str, Decimal]:
        """Calculate derived inputs from assumptions."""
        purchase_price = self.p.purchase_price
        down_payment_pct = self.p.down_payment_pct
        down_payment = purchase_price * down_payment_pct

        # Acquisition costs
        transfer_tax = purchase_price * self.p.transfer_tax_pct
        total_acq_costs = (
            transfer_tax +
            self.p.lender_fees +
            self.p.title_insurance +
            self.p.inspection_appraisal +
            self.p.attorney_fees +
            self.p.other_closing_costs
        )

        total_cash_to_close = down_payment + total_acq_costs

        # Mortgage
        loan_amount = purchase_price - down_payment

        # Monthly payment using standard formula: P * [r(1+r)^n]/[(1+r)^n-1]
        # where r = monthly rate, n = months, P = principal
        annual_rate = self.p.interest_rate
        monthly_rate = annual_rate / Decimal(12)
        months = self.p.term_years * 12

        if monthly_rate > 0:
            factor = (1 + monthly_rate) ** months
            monthly_payment = loan_amount * (monthly_rate * factor) / (factor - 1)
            annual_payment = monthly_payment * Decimal(12)
        else:
            monthly_payment = loan_amount / months
            annual_payment = monthly_payment * Decimal(12)

        # PMI (monthly)
        pmi_monthly = loan_amount * self.p.pmi_rate / Decimal(12)
        pmi_annual = pmi_monthly * Decimal(12)

        return {
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

    def _calculate_income_schedule(self, derived: Dict) -> List[Dict]:
        """Calculate yearly rental income schedule."""
        schedule = []

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            year = self.p.purchase_year + year_num - 1

            # Calculate rent per unit
            rent_growth_factor = (1 + self.p.annual_rent_growth_pct) ** (year_num - 1)

            unit_rents = []
            total_monthly_rent = Decimal('0')

            for unit in self.units:
                # Zero rent during owner-occupied years
                if year_num <= unit.owner_occupied_years:
                    unit_rent = Decimal('0')
                else:
                    unit_rent = unit.monthly_rent * rent_growth_factor

                unit_rents.append(unit_rent)
                total_monthly_rent += unit_rent

            gross_annual_rent = total_monthly_rent * Decimal(12)
            vacancy_loss = gross_annual_rent * self.p.vacancy_rate_pct
            property_mgmt_fee = (gross_annual_rent - vacancy_loss) * self.p.property_mgmt_pct
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

    def _calculate_expense_schedule(self, derived: Dict) -> List[Dict]:
        """Calculate yearly operating expense schedule."""
        schedule = []
        purchase_price = derived['purchase_price']

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            year = self.p.purchase_year + year_num - 1

            # Home value appreciates
            home_value = purchase_price * (1 + self.p.annual_appreciation_pct) ** (year_num - 1)

            # Expenses inflate
            expense_inflation_factor = (1 + self.p.expense_inflation_pct) ** (year_num - 1)

            property_tax = home_value * self.p.property_tax_pct
            insurance = self.p.insurance_annual * expense_inflation_factor
            hoa = self.p.hoa_annual * expense_inflation_factor
            maintenance = home_value * self.p.maintenance_pct
            utilities = self.p.utilities_annual * expense_inflation_factor

            total_operating = property_tax + insurance + hoa + maintenance + utilities

            # PMI may drop off after 20% equity is paid down
            # Simplified: keep PMI until loan is paid
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

            # Annual payment, interest, principal
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
            cumulative_interest += annual_interest

            # PMI drops off when LTV <= 80%
            pmi = derived['pmi_annual']
            if balance > 0:
                ltv = balance / loan_amount
                if ltv <= Decimal('0.80'):
                    pmi = Decimal('0')
            else:
                pmi = Decimal('0')

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

    def _calculate_equity_schedule(self, derived: Dict, income_schedule: List[Dict],
                                   expense_schedule: List[Dict], mortgage_schedule: List[Dict]) -> List[Dict]:
        """Calculate yearly equity and returns."""
        schedule = []
        purchase_price = derived['purchase_price']
        cumulative_cf = Decimal('0')

        for year_num in range(1, self.p.analysis_horizon_years + 1):
            income = Decimal(str(income_schedule[year_num - 1]['effective_rental_income']))
            operating_expenses = Decimal(str(expense_schedule[year_num - 1]['total_operating']))
            debt_service = Decimal(str(expense_schedule[year_num - 1]['debt_service']))

            noi = income - operating_expenses

            # Home value
            home_value = purchase_price * (1 + self.p.annual_appreciation_pct) ** (year_num - 1)

            # Loan balance from mortgage schedule
            loan_balance = Decimal(str(mortgage_schedule[year_num - 1]['ending_balance']))

            # Equity
            gross_equity = home_value - loan_balance

            # Cash flow
            annual_cf = income - operating_expenses - debt_service
            cumulative_cf += annual_cf

            # Cap rate (NOI / purchase price)
            cap_rate = noi / purchase_price if purchase_price > 0 else Decimal('0')

            # If we sell this year, calculate net proceeds
            if self.p.sale_year == year_num and self.p.sale_year > 0:
                selling_costs = home_value * self.p.selling_costs_pct
                net_proceeds = home_value - loan_balance - selling_costs
                total_return = cumulative_cf + net_proceeds
            else:
                net_proceeds = Decimal('0')
                total_return = Decimal('0')

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

        for year_num in range(1, len(income_schedule) + 1):
            income = Decimal(str(income_schedule[year_num - 1]['effective_rental_income']))
            operating_expenses = Decimal(str(expense_schedule[year_num - 1]['total_operating']))
            debt_service = Decimal(str(expense_schedule[year_num - 1]['debt_service']))
            noi = income - operating_expenses

            annual_cf = noi - debt_service
            monthly_cf = annual_cf / Decimal(12)

            cumulative_cf += annual_cf

            # DSCR
            dscr = noi / debt_service if debt_service > 0 else Decimal('0')

            # Cash-on-cash return (would need cash_to_close to calculate properly)
            coc_return = Decimal('0')  # Placeholder

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
        down_payment = derived['down_payment']
        total_cash_to_close = derived['total_cash_to_close']

        # Extract key year values
        year1_income = Decimal(str(income_schedule[0]['gross_annual_rent']))
        year1_noi = Decimal(str(cashflow_schedule[0]['noi']))
        year1_cf = Decimal(str(cashflow_schedule[0]['annual_cash_flow']))

        year3_noi = Decimal(str(cashflow_schedule[2]['noi'])) if len(cashflow_schedule) > 2 else Decimal('0')
        year3_cf = Decimal(str(cashflow_schedule[2]['annual_cash_flow'])) if len(cashflow_schedule) > 2 else Decimal('0')
        year3_dscr = Decimal(str(cashflow_schedule[2]['dscr'])) if len(cashflow_schedule) > 2 else Decimal('0')

        # Metrics
        one_percent_rule = year1_income / purchase_price if purchase_price > 0 else Decimal('0')
        grm = purchase_price / year1_income if year1_income > 0 else Decimal('999')
        cap_rate_yr1 = year1_noi / purchase_price if purchase_price > 0 else Decimal('0')
        coc_yr1 = year1_cf / total_cash_to_close if total_cash_to_close > 0 else Decimal('0')
        coc_yr3 = year3_cf / total_cash_to_close if total_cash_to_close > 0 else Decimal('0')

        # Break-even year
        break_even_year = None
        for i, item in enumerate(cashflow_schedule):
            if item['cumulative_cash_flow'] >= 0:
                break_even_year = i + 1
                break

        if break_even_year is None:
            break_even_year = self.p.analysis_horizon_years

        # Total MOIC (simplified)
        final_cf = Decimal(str(cashflow_schedule[-1]['cumulative_cash_flow']))
        total_moic = (final_cf + total_cash_to_close) / total_cash_to_close if total_cash_to_close > 0 else Decimal('1')

        # Approximate IRR (simplified)
        implied_irr = Decimal('0')
        if final_cf > 0:
            total_return = final_cf
            implied_irr = (total_return / total_cash_to_close) ** (1 / Decimal(self.p.analysis_horizon_years)) - 1

        return {
            'one_percent_rule': {
                'value': float(one_percent_rule),
                'benchmark': 0.01,
                'pass': float(one_percent_rule) >= 0.01,
                'description': 'Monthly Rent / Price ≥ 1%',
            },
            'grm': {
                'value': float(grm),
                'benchmark': 10.0,
                'pass': float(grm) <= 10.0,
                'description': 'Gross Rent Multiplier ≤ 10x',
            },
            'cap_rate_yr1': {
                'value': float(cap_rate_yr1),
                'benchmark': 0.06,
                'pass': float(cap_rate_yr1) >= 0.06,
                'description': 'Yr 1 Cap Rate ≥ 6%',
            },
            'coc_yr1': {
                'value': float(coc_yr1),
                'benchmark': 0.0,
                'pass': float(coc_yr1) >= 0.0,
                'description': 'Yr 1 Cash-on-Cash ≥ 0%',
            },
            'coc_yr3': {
                'value': float(coc_yr3),
                'benchmark': 0.04,
                'pass': float(coc_yr3) >= 0.04,
                'description': 'Yr 3 Cash-on-Cash ≥ 4%',
            },
            'dscr_yr3': {
                'value': float(year3_dscr),
                'benchmark': 1.25,
                'pass': float(year3_dscr) >= 1.25,
                'description': 'Yr 3 DSCR ≥ 1.25x',
            },
            'break_even_year': {
                'value': break_even_year,
                'benchmark': 10,
                'pass': break_even_year <= 10,
                'description': 'Break-even ≤ 10 years',
            },
            'total_moic': {
                'value': float(total_moic),
                'benchmark': 3.0,
                'pass': float(total_moic) >= 3.0,
                'description': 'Total MOIC ≥ 3x',
            },
            'implied_irr': {
                'value': float(implied_irr),
                'benchmark': 0.10,
                'pass': float(implied_irr) >= 0.10,
                'description': 'Implied IRR ≥ 10%',
            },
        }
