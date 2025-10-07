from django import forms
from django.contrib import messages as messages
from django.shortcuts import redirect
from django.utils.html import format_html  
from django.urls import path
from django.http import HttpResponse
from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import (
    CustomUser, Gisement, Chantier, Melange, AmendementOrganique, Plateforme, 
    ProduitVente, SuiviStockPlateforme, MelangeIngredient, MelangeAmendement,
    DocumentProduitVente, SaisieVente, ChantierRecepteur, Planning
)


class SuiviStockPlateformeForm(forms.ModelForm):
    class Meta:
        model = SuiviStockPlateforme
        fields = '__all__'
    
    def clean(self):
        cleaned_data = super().clean()
        plateforme = cleaned_data.get('plateforme')
        andain_numero = cleaned_data.get('andain_numero')
        
        if plateforme and andain_numero:
            # Vérifier si cette combinaison existe déjà (sauf pour l'instance actuelle en cas de modification)
            existing = SuiviStockPlateforme.objects.filter(
                plateforme=plateforme, 
                andain_numero=andain_numero
            )
            
            if self.instance.pk:
                existing = existing.exclude(pk=self.instance.pk)
                
            if existing.exists():
                existing_record = existing.first()
                raise ValidationError(
                    f"Un andain avec le numéro {andain_numero} existe déjà sur la plateforme {plateforme}. "
                    f"Il est associé au mélange '{existing_record.melange}' avec un statut '{existing_record.get_statut_display()}'. "
                    f"Veuillez choisir un autre numéro d'andain."
                )
        
        return cleaned_data


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


@admin.register(SuiviStockPlateforme)
class SuiviStockPlateformeAdmin(admin.ModelAdmin):
    form = SuiviStockPlateformeForm
    list_display = (
        'andain_numero',
        'reference_suivi', 
        'plateforme_nom',
        'melange_nom',
        'volume_initial_m3',
        'volume_restant_m3',
        'volume_ecoule_display',
        'taux_ecoulement_display',
        'statut_display',
        'date_mise_en_culture',
        'date_previsionnelle_vente'
    )
    
    list_filter = (
        'statut',
        'plateforme',
        'melange',
        'date_mise_en_andains',
        'date_mise_en_culture'
    )
    
    search_fields = (
        'reference_suivi',
        'plateforme__nom',
        'melange__nom',
        'recette',
        'remarques'
    )
    
    readonly_fields = (
        'reference_suivi',
        'volume_ecoule_display',
        'taux_ecoulement_display',
        'duree_stockage_display',
        'utilisateur',
        'date_creation',
        'date_modification'
    )
    
    fieldsets = (
        ('Identification', {
            'fields': ('andain_numero', 'reference_suivi', 'plateforme', 'melange', 'produit_vente')
        }),
        ('Volumes et Statut', {
            'fields': ('volume_initial_m3', 'volume_restant_m3', 'statut', 'volume_ecoule_display', 'taux_ecoulement_display')
        }),
        ('Dates importantes', {
            'fields': ('date_mise_en_andains', 'date_mise_en_culture', 'date_previsionnelle_vente', 'date_ecoulement')
        }),
        ('Informations techniques', {
            'fields': ('recette', 'remarques')
        }),
        ('Métadonnées', {
            'fields': ('utilisateur', 'duree_stockage_display', 'date_creation', 'date_modification'),
            'classes': ('collapse',)
        })
    )
    
    ordering = ['plateforme', 'andain_numero']
    list_per_page = 20
    actions = ['marquer_ecoule', 'marquer_pret_vente', 'exporter_csv']
    
    def plateforme_nom(self, obj):
        return obj.plateforme.nom if obj.plateforme else '-'
    plateforme_nom.short_description = 'Plateforme'
    plateforme_nom.admin_order_field = 'plateforme__nom'
    
    def melange_nom(self, obj):
        return obj.melange.nom if obj.melange else '-'
    melange_nom.short_description = 'Mélange'
    melange_nom.admin_order_field = 'melange__nom'
    
    def volume_ecoule_display(self, obj):
        volume = obj.volume_ecoule_m3
        if volume is not None:
            return f"{volume} m³"
        return "-"
    volume_ecoule_display.short_description = 'Volume écoulé'
    
    def taux_ecoulement_display(self, obj):
        taux = obj.taux_ecoulement_percent
        if taux is None or (obj.volume_initial_m3 is None):
            return "-"
        
        if taux >= 100:
            color = 'green'
        elif taux >= 50:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} %</span>',
            color, taux
        )
    taux_ecoulement_display.short_description = 'Taux écoulement'
    
    def statut_display(self, obj):
        statut_colors = {
            'en_cours': '#ffc107',
            'en_culture': '#17a2b8',
            'pret_vente': '#28a745',
            'ecoule': '#6c757d',
            'suspendu': '#dc3545'
        }
        color = statut_colors.get(obj.statut, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            color, obj.get_statut_display()
        )
    statut_display.short_description = 'Statut'
    
    def duree_stockage_display(self, obj):
        duree = obj.duree_stockage_jours
        if duree is not None:
            return f"{duree} jours"
        return '-'
    duree_stockage_display.short_description = 'Durée stockage'
    
    def marquer_ecoule(self, request, queryset):
        count = 0
        for obj in queryset:
            if obj.statut != 'ecoule':
                obj.statut = 'ecoule'
                obj.volume_restant_m3 = 0
                obj.save()
                count += 1
        
        self.message_user(
            request,
            f"{count} andain(s) marqué(s) comme écoulé(s).",
            messages.SUCCESS
        )
    marquer_ecoule.short_description = "Marquer comme écoulé"
    
    def marquer_pret_vente(self, request, queryset):
        count = queryset.filter(statut__in=['en_cours', 'en_culture']).update(statut='pret_vente')
        self.message_user(
            request,
            f"{count} andain(s) marqué(s) comme prêt pour vente.",
            messages.SUCCESS
        )
    marquer_pret_vente.short_description = "Marquer comme prêt pour vente"
    
    def exporter_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="suivi_stock_plateforme.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Andain', 'Référence', 'Plateforme', 'Mélange', 'Volume initial (m³)',
            'Volume restant (m³)', 'Statut', 'Date mise en culture', 'Date prév. vente', 'Recette'
        ])
        
        for obj in queryset:
            writer.writerow([
                obj.andain_numero,
                obj.reference_suivi,
                obj.plateforme.nom if obj.plateforme else '',
                obj.melange.nom if obj.melange else '',
                obj.volume_initial_m3,
                obj.volume_restant_m3,
                obj.get_statut_display(),
                obj.date_mise_en_culture or '',
                obj.date_previsionnelle_vente or '',
                obj.recette or ''
            ])
        
        return response
    exporter_csv.short_description = "Exporter en CSV"
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.utilisateur = request.user
        
        try:
            super().save_model(request, obj, form, change)
        except Exception as e:
            if "unique constraint" in str(e).lower() or "unique_together" in str(e).lower():
                self.message_user(
                    request,
                    f"Erreur : Un andain avec le numéro {obj.andain_numero} existe déjà sur la plateforme {obj.plateforme}. Veuillez choisir un autre numéro d'andain.",
                    messages.ERROR
                )
            else:
                self.message_user(
                    request,
                    f"Erreur lors de la sauvegarde : {str(e)}",
                    messages.ERROR
                )
            raise
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'plateforme', 'melange', 'produit_vente', 'utilisateur'
        )
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Ajouter une aide pour le numéro d'andain
        if 'andain_numero' in form.base_fields:
            help_text = "Numéro unique de l'andain sur cette plateforme."
            if not obj:  # Nouveau formulaire
                help_text += " Conseil : Vérifiez les numéros existants pour éviter les doublons."
            form.base_fields['andain_numero'].help_text = help_text
            
        return form


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