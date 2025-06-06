from django.contrib import admin
from .models import (
    CustomUser, Chantier, DocumentGisement, Gisement, Compost, Plateforme,
    Melange, ProduitVente, DocumentTechnique, AnalyseLaboratoire
)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'company_name', 'role', 'email', )
    list_filter = ('role',)

@admin.register(Chantier)
class ChantierAdmin(admin.ModelAdmin):
    list_display = ('nom', 'maitre_ouvrage', 'entreprise_terrassement')

@admin.register(Gisement)
class GisementAdmin(admin.ModelAdmin):
    list_display = ('commune', 'periode_terrassement', 'volume_terrasse')
    list_filter = ('type_de_sol',)

@admin.register(Compost)
class CompostAdmin(admin.ModelAdmin):
    list_display = ('fournisseur', 'date_reception', 'volume')

@admin.register(Melange)
class MelangeAdmin(admin.ModelAdmin):
    list_display = ('reference_produit', 'plateforme', 'periode_melange')

@admin.register(ProduitVente)
class ProduitVenteAdmin(admin.ModelAdmin):
    list_display = ('reference_produit', 'chantier', 'volume_disponible', 'volume_vendu')

@admin.register(DocumentTechnique)
class DocumentTechniqueAdmin(admin.ModelAdmin):
    list_display = ('type_document', 'produit', 'date_ajout')

@admin.register(DocumentGisement)
class DocumentGisementAdmin(admin.ModelAdmin):
    list_display = ('gisement', 'nom_fichier', 'date_ajout')
    search_fields = ('gisement__commune', 'nom_fichier')
    list_filter = ('gisement__commune', 'date_ajout')
    ordering = ('-date_ajout',)

@admin.register(AnalyseLaboratoire)
class AnalyseLaboratoireAdmin(admin.ModelAdmin):
    list_display = ('produit', 'laboratoire', 'date_analyse', 'ph_eau')

@admin.register(Plateforme)
class PlateformeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'localisation', 'latitude','longitude', 'responsable')
    search_fields = ('nom', 'localisation', 'responsable__username')
    list_filter = ('responsable__role',)