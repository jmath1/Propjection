from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Property, Projection, RentalUnit
from .calculator import ProjectionCalculator


class RentalUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentalUnit
        fields = ['id', 'label', 'monthly_rent', 'owner_occupied_years', 'order']


class ProjectionSerializer(serializers.ModelSerializer):
    units = RentalUnitSerializer(many=True, read_only=True)

    class Meta:
        model = Projection
        fields = [
            'id', 'property', 'name',
            'purchase_year', 'analysis_horizon_years', 'sale_year',
            'purchase_price', 'down_payment_pct', 'annual_appreciation_pct',
            'transfer_tax_pct', 'lender_fees', 'title_insurance', 'inspection_appraisal',
            'attorney_fees', 'other_closing_costs',
            'interest_rate', 'term_years', 'pmi_rate',
            'annual_rent_growth_pct', 'vacancy_rate_pct', 'property_mgmt_pct',
            'property_tax_pct', 'insurance_annual', 'hoa_annual', 'maintenance_pct',
            'utilities_annual', 'expense_inflation_pct',
            'selling_costs_pct',
            'scenario_appreciation_delta', 'scenario_rent_growth_delta',
            'scenario_vacancy_delta', 'scenario_expense_inflation_delta',
            'estimated_annual_income', 'repairs_annual',
            'units', 'created_at', 'updated_at'
        ]


class PropertySerializer(serializers.ModelSerializer):
    projections = ProjectionSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = ['id', 'name', 'address', 'property_type', 'notes', 'projections', 'created_at', 'updated_at']


class ProjectionResultsSerializer(serializers.Serializer):
    """Serializer for computed projection results."""
    derived = serializers.DictField()
    income_schedule = serializers.ListField()
    expense_schedule = serializers.ListField()
    mortgage_schedule = serializers.ListField()
    equity_schedule = serializers.ListField()
    cashflow_schedule = serializers.ListField()
    base_case = serializers.DictField()
    scenarios = serializers.DictField()
    verdict = serializers.DictField()
    tax_forecast = serializers.ListField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        data['user'] = user
        return data
