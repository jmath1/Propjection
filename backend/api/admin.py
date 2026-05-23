from django.contrib import admin
from .models import Property, Projection, RentalUnit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['name', 'property_type', 'created_at']
    list_filter = ['property_type', 'created_at']
    search_fields = ['name', 'address']


class RentalUnitInline(admin.TabularInline):
    model = RentalUnit
    extra = 1


@admin.register(Projection)
class ProjectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'property', 'purchase_price', 'created_at']
    list_filter = ['property', 'created_at']
    search_fields = ['name', 'property__name']
    inlines = [RentalUnitInline]


@admin.register(RentalUnit)
class RentalUnitAdmin(admin.ModelAdmin):
    list_display = ['label', 'projection', 'monthly_rent', 'owner_occupied_years']
    list_filter = ['projection']
    search_fields = ['label', 'projection__name']
