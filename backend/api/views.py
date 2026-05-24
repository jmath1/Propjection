from rest_framework import viewsets, status, views
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Property, Projection, RentalUnit
from .serializers import PropertySerializer, ProjectionSerializer, RentalUnitSerializer, ProjectionResultsSerializer, LoginSerializer, UserSerializer
from .calculator import ProjectionCalculator


class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    filterset_fields = ['property_type']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Property.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RentalUnitViewSet(viewsets.ModelViewSet):
    queryset = RentalUnit.objects.all()
    serializer_class = RentalUnitSerializer
    ordering = ['order']

    def get_queryset(self):
        projection_id = self.request.query_params.get('projection_id')
        if projection_id:
            return RentalUnit.objects.filter(projection_id=projection_id)
        return super().get_queryset()


class ProjectionViewSet(viewsets.ModelViewSet):
    queryset = Projection.objects.all()
    serializer_class = ProjectionSerializer
    ordering = ['-created_at']

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get computed projection results."""
        projection = self.get_object()
        units = projection.units.all()

        calculator = ProjectionCalculator(projection, units)
        results = calculator.calculate()

        serializer = ProjectionResultsSerializer(results)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def scenarios(self, request, pk=None):
        """Get scenario analysis (Bull/Base/Bear)."""
        projection = self.get_object()
        units = projection.units.all()

        calculator = ProjectionCalculator(projection, units)
        full_results = calculator.calculate()

        return Response(full_results['scenarios'])

    @action(detail=True, methods=['get'])
    def verdict(self, request, pk=None):
        """Get deal verdict metrics."""
        projection = self.get_object()
        units = projection.units.all()

        calculator = ProjectionCalculator(projection, units)
        full_results = calculator.calculate()

        return Response(full_results['verdict'])

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Clone a projection with a new name."""
        projection = self.get_object()
        name = request.data.get('name', f"{projection.name} (Copy)")

        # Create new projection with same values
        new_projection = Projection.objects.create(
            property=projection.property,
            name=name,
            purchase_year=projection.purchase_year,
            analysis_horizon_years=projection.analysis_horizon_years,
            sale_year=projection.sale_year,
            purchase_price=projection.purchase_price,
            down_payment_pct=projection.down_payment_pct,
            annual_appreciation_pct=projection.annual_appreciation_pct,
            transfer_tax_pct=projection.transfer_tax_pct,
            lender_fees=projection.lender_fees,
            title_insurance=projection.title_insurance,
            inspection_appraisal=projection.inspection_appraisal,
            attorney_fees=projection.attorney_fees,
            other_closing_costs=projection.other_closing_costs,
            interest_rate=projection.interest_rate,
            term_years=projection.term_years,
            pmi_rate=projection.pmi_rate,
            annual_rent_growth_pct=projection.annual_rent_growth_pct,
            vacancy_rate_pct=projection.vacancy_rate_pct,
            property_mgmt_pct=projection.property_mgmt_pct,
            property_tax_pct=projection.property_tax_pct,
            insurance_annual=projection.insurance_annual,
            hoa_annual=projection.hoa_annual,
            maintenance_pct=projection.maintenance_pct,
            utilities_annual=projection.utilities_annual,
            expense_inflation_pct=projection.expense_inflation_pct,
            selling_costs_pct=projection.selling_costs_pct,
            scenario_appreciation_delta=projection.scenario_appreciation_delta,
            scenario_rent_growth_delta=projection.scenario_rent_growth_delta,
            scenario_vacancy_delta=projection.scenario_vacancy_delta,
            scenario_expense_inflation_delta=projection.scenario_expense_inflation_delta,
        )

        # Clone units
        for unit in projection.units.all():
            RentalUnit.objects.create(
                projection=new_projection,
                label=unit.label,
                monthly_rent=unit.monthly_rent,
                owner_occupied_years=unit.owner_occupied_years,
                order=unit.order,
            )

        serializer = self.get_serializer(new_projection)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login endpoint that returns auth token."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register endpoint to create new user."""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )
    token, created = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)
