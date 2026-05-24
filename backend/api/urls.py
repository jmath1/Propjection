from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, ProjectionViewSet, RentalUnitViewSet, login, register

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'projections', ProjectionViewSet, basename='projection')
router.register(r'units', RentalUnitViewSet, basename='unit')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login, name='login'),
    path('auth/register/', register, name='register'),
]
