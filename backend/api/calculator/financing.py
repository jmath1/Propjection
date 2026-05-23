from decimal import Decimal
from typing import Tuple, Dict


class FinancingMixin:
    """Calculates upfront financing: down payment, acquisition costs, loan, and PMI."""

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
        transfer_tax = self.p.purchase_price * self.p.transfer_tax_pct
        total_acq_costs = (
            transfer_tax +
            self.p.lender_fees +
            self.p.title_insurance +
            self.p.inspection_appraisal +
            self.p.attorney_fees +
            self.p.other_closing_costs
        )
        return transfer_tax, total_acq_costs

    def _calc_pmi(self, loan_amount: Decimal) -> Tuple[Decimal, Decimal]:
        """Calculate monthly and annual PMI."""
        pmi_monthly = loan_amount * self.p.pmi_rate / Decimal(12)
        pmi_annual = pmi_monthly * Decimal(12)
        return pmi_monthly, pmi_annual

    def _derive_inputs(self) -> Dict[str, Decimal]:
        """Calculate derived inputs from assumptions."""
        purchase_price = self.p.purchase_price
        down_payment_pct = self.p.down_payment_pct
        down_payment = purchase_price * down_payment_pct

        transfer_tax, total_acq_costs = self._calc_acquisition_costs()
        total_cash_to_close = down_payment + total_acq_costs

        loan_amount = purchase_price - down_payment
        monthly_payment = self._calc_monthly_payment(loan_amount, self.p.interest_rate, self.p.term_years)
        annual_payment = monthly_payment * Decimal(12)

        pmi_monthly, pmi_annual = self._calc_pmi(loan_amount)
        monthly_rate = self.p.interest_rate / Decimal(12)

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
