from django import forms
from django.contrib import messages as messages
from django.utils.html import format_html  
from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import (
    CustomUser, Gisement, Chantier, Melange, AmendementOrganique, Plateforme, 
    ProduitVente, MelangeIngredient, MelangeAmendement,
    DocumentProduitVente, SaisieVente, ChantierRecepteur, Planning,
    FicheAgroPedodeSol, FicheHorizon, FichePhoto
)

from django import forms





# Register your models here.

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'role', 'company_name', 'phone_number')
    list_filter = ('role',)
    search_fields = ('username', 'company_name', 'phone_number')


@admin.register(Gisement)
class GisementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'localisation', 'date_creation')
    search_fields = ('nom', 'localisation')


@admin.register(Chantier)
class ChantierAdmin(admin.ModelAdmin):
    list_display = ('nom', 'localisation', 'maitre_ouvrage', 'date_creation', 'is_active')
    list_filter = ('is_active', 'date_creation')
    search_fields = ('nom', 'localisation', 'maitre_ouvrage')


@admin.register(Melange)
class MelangeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'date_creation')
    search_fields = ('nom',)


@admin.register(AmendementOrganique)
class AmendementOrganiqueAdmin(admin.ModelAdmin):
    list_display = ('nom', 'numero_sequence', 'plateforme', 'fournisseur', 'date_reception')
    list_filter = ('plateforme', 'fournisseur', 'date_reception')
    search_fields = ('nom', 'plateforme__nom', 'fournisseur')
    readonly_fields = ('numero_sequence',)
    ordering = ['numero_sequence']


@admin.register(ProduitVente)
class ProduitVenteAdmin(admin.ModelAdmin):
    list_display = ('reference_produit', 'melange', 'pret_pour_vente', 'date_creation')
    list_filter = ('pret_pour_vente', 'date_creation')
    search_fields = ('reference_produit', 'melange__nom')


@admin.register(Plateforme)
class PlateformeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'localisation', 'latitude','longitude')
    search_fields = ('nom', 'localisation')





# Enregistrements simples pour les autres modèles
@admin.register(MelangeIngredient)
class MelangeIngredientAdmin(admin.ModelAdmin):
    list_display = ('melange', 'gisement', 'pourcentage')

@admin.register(MelangeAmendement)
class MelangeAmendementAdmin(admin.ModelAdmin):
    list_display = ('melange', 'amendementOrganique', 'pourcentage')

@admin.register(DocumentProduitVente)
class DocumentProduitVenteAdmin(admin.ModelAdmin):
    list_display = ('produit', 'fichier', 'date_ajout')

@admin.register(SaisieVente)
class SaisieVenteAdmin(admin.ModelAdmin):
    list_display = ('produit', 'date_achat', 'volume_tonne')

@admin.register(ChantierRecepteur)
class ChantierRecepteurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'adresse', 'date_creation')

@admin.register(Planning)
class PlanningAdmin(admin.ModelAdmin):
    list_display = ('titre', 'date_debut', 'duree_jours', 'statut')

@admin.register(FicheAgroPedodeSol)
class FicheAgroPedodeSolAdmin(admin.ModelAdmin):
    list_display = ('nom_sondage', 'EAP', 'ville', 'projet', 'date')
    search_fields = ('nom_sondage', 'EAP', 'ville', 'projet')
    list_filter = ('EAP', 'ville', 'date')
@admin.register(FicheHorizon)
class FicheHorizonAdmin(admin.ModelAdmin):
    list_display = ('nom', 'fiche', 'profondeur', 'texture', 'echantillon')
    search_fields = ('nom', 'fiche__nom_sondage', 'echantillon')
    list_filter = ('fiche', 'nom')
    ordering = ['fiche', 'nom']
    autocomplete_fields = ['fiche']  # Facilite la recherche si beaucoup de fiches

@admin.register(FichePhoto)
class FichePhotoAdmin(admin.ModelAdmin):
    list_display = ('horizon', 'image', 'description')
    search_fields = ('horizon__fiche__nom_sondage', 'description')
    list_filter = ('horizon',)
    ordering = ['horizon', 'id']
    autocomplete_fields = ['horizon']  # Facilite la recherche si beaucoup d'horizons