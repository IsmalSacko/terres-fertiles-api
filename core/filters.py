# app/filters.py
import django_filters
from .models import Chantier, Gisement, Melange

class GisementFilter(django_filters.FilterSet):
    nom = django_filters.CharFilter(field_name='nom', lookup_expr='icontains')
    commune = django_filters.CharFilter(field_name='commune', lookup_expr='icontains')
    annee = django_filters.NumberFilter(field_name='date_creation', lookup_expr='year')

    class Meta:
        model = Gisement
        fields = ['nom', 'commune', 'annee']

# filtrer les chantiers par nom, commune, création, date_creation, maitre_ouvrage, entreprise_terrassement
class ChantierFilter(django_filters.FilterSet):
    nom = django_filters.CharFilter(field_name='nom', lookup_expr='icontains')
    commune = django_filters.CharFilter(field_name='commune', lookup_expr='icontains')
    maitre_ouvrage = django_filters.CharFilter(field_name='maitre_ouvrage', lookup_expr='icontains')
    entreprise_terrassement = django_filters.CharFilter(field_name='entreprise_terrassement', lookup_expr='icontains')
    date_creation = django_filters.DateFromToRangeFilter(field_name='date_creation')

    class Meta:
        model = Chantier
        fields = ['nom', 'commune', 'maitre_ouvrage', 'entreprise_terrassement', 'date_creation']

        
# filtrer les melanges par nom, commune, fournisseur et date_creation
class MelangeFilter(django_filters.FilterSet):
    nom = django_filters.CharFilter(field_name='nom', lookup_expr='icontains')
    fournisseur = django_filters.CharFilter(field_name='fournisseur', lookup_expr='icontains')
    date_creation = django_filters.DateFromToRangeFilter(field_name='date_creation')

    class Meta:
        model = Melange
        fields = ['nom', 'commune', 'fournisseur', 'date_creation']