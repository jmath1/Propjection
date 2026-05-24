from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ('sfh', 'Single Family Home'),
        ('duplex', 'Duplex'),
        ('triplex', 'Triplex'),
        ('quad', 'Quadplex'),
        ('multiunit', 'Multi-Unit'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties', null=True, blank=True)
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Projection(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='projections')
    name = models.CharField(max_length=200, default='Base Case')

    # Timeline
    purchase_year = models.IntegerField(default=2026)
    analysis_horizon_years = models.IntegerField(default=30)
    sale_year = models.IntegerField(default=0)  # 0 = hold, year > 0 = sell in that year

    # Property / Acquisition
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    down_payment_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.1000'))  # 10%
    annual_appreciation_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0300'))  # 3%

    # Acquisition Costs
    transfer_tax_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0100'))
    lender_fees = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('4000.00'))
    title_insurance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('3500.00'))
    inspection_appraisal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1500.00'))
    attorney_fees = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('2000.00'))
    other_closing_costs = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1000.00'))

    # Mortgage
    interest_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0650'))  # 6.5%
    term_years = models.IntegerField(default=30)
    pmi_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0050'))  # 0.5%
    refinance_year = models.PositiveIntegerField(default=0)  # 0 = no refinance
    refinance_rate = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)

    # Rental
    annual_rent_growth_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0300'))  # 3%
    vacancy_rate_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0000'))  # 0%
    property_mgmt_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0800'))  # 8%

    # Operating Expenses
    property_tax_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0120'))  # 1.2%
    insurance_annual = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('2400.00'))
    hoa_annual = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    maintenance_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0100'))  # 1%
    utilities_annual = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('2400.00'))
    expense_inflation_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0250'))  # 2.5%

    # Sale
    selling_costs_pct = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0600'))  # 6%

    # Scenario Margins (±pp)
    scenario_appreciation_delta = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0200'))  # 2pp
    scenario_rent_growth_delta = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0300'))  # 3pp
    scenario_vacancy_delta = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0500'))  # 5pp
    scenario_expense_inflation_delta = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.0150'))  # 1.5pp

    # Tax Forecast
    estimated_annual_income = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    repairs_annual = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.property.name} - {self.name}"


class RentalUnit(models.Model):
    projection = models.ForeignKey(Projection, on_delete=models.CASCADE, related_name='units')
    label = models.CharField(max_length=50, default='Unit 1')
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    owner_occupied_years = models.IntegerField(default=0)  # Number of initial years where rent = $0
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.projection} - {self.label}"
