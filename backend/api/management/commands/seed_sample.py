from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
from api.models import Property, Projection, RentalUnit


class Command(BaseCommand):
    help = 'Load sample triplex data and create admin user'

    def handle(self, *args, **options):
        # Create admin user if it doesn't exist
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@propjection.local',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin')
            admin_user.save()
            self.stdout.write(f'Created admin user: {admin_user.username}')
        else:
            self.stdout.write(f'Admin user already exists: {admin_user.username}')

        # Create property
        property = Property.objects.create(
            user=admin_user,
            name='1210 S 10th Street',
            address='1210 S 10th Street',
            property_type='triplex',
            notes=''
        )
        self.stdout.write(f'Created property: {property.name}')

        # Create projection with all assumptions
        projection = Projection.objects.create(
            property=property,
            name='Base Case',
            purchase_year=2026,
            analysis_horizon_years=30,
            sale_year=0,
            purchase_price=Decimal('485000.00'),
            down_payment_pct=Decimal('0.1000'),
            annual_appreciation_pct=Decimal('0.0300'),
            transfer_tax_pct=Decimal('0.0100'),
            lender_fees=Decimal('4000.00'),
            title_insurance=Decimal('3500.00'),
            inspection_appraisal=Decimal('1500.00'),
            attorney_fees=Decimal('2000.00'),
            other_closing_costs=Decimal('1000.00'),
            interest_rate=Decimal('0.0650'),
            term_years=30,
            pmi_rate=Decimal('0.0050'),
            annual_rent_growth_pct=Decimal('0.0300'),
            vacancy_rate_pct=Decimal('0.0000'),
            property_mgmt_pct=Decimal('0.0800'),
            property_tax_pct=Decimal('0.0120'),
            insurance_annual=Decimal('2400.00'),
            hoa_annual=Decimal('0.00'),
            maintenance_pct=Decimal('0.0100'),
            utilities_annual=Decimal('2400.00'),
            expense_inflation_pct=Decimal('0.0250'),
            selling_costs_pct=Decimal('0.0600'),
            scenario_appreciation_delta=Decimal('0.0200'),
            scenario_rent_growth_delta=Decimal('0.0300'),
            scenario_vacancy_delta=Decimal('0.0500'),
            scenario_expense_inflation_delta=Decimal('0.0150'),
        )
        self.stdout.write(f'Created projection: {projection.name}')

        # Create rental units
        units = [
            {'label': 'Unit 1', 'monthly_rent': Decimal('1400.00'), 'owner_occupied_years': 2},
            {'label': 'Unit 2', 'monthly_rent': Decimal('1750.00'), 'owner_occupied_years': 0},
            {'label': 'Unit 3', 'monthly_rent': Decimal('1550.00'), 'owner_occupied_years': 0},
        ]

        for i, unit_data in enumerate(units):
            unit = RentalUnit.objects.create(
                projection=projection,
                label=unit_data['label'],
                monthly_rent=unit_data['monthly_rent'],
                owner_occupied_years=unit_data['owner_occupied_years'],
                order=i,
            )
            self.stdout.write(f'  Created {unit.label}: ${unit.monthly_rent}/month')

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded sample triplex with admin user'))
