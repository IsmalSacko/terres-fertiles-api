from django import forms
from django.contrib import messages as messages
from django.shortcuts import redirect
from django.utils.html import format_html  
from django.urls import path

from django.contrib import admin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect


from .models import (
    ChantierRecepteur, CustomUser, Chantier, DocumentGisement, DocumentProduitVente, Gisement, AmendementOrganique, MelangeAmendement, Planning, Plateforme,
    Melange, ProduitVente, DocumentTechnique, AnalyseLaboratoire, MelangeIngredient, SaisieVente
)

# ───────────── Inlines ─────────────
class MelangeIngredientInline(admin.TabularInline):
    model = MelangeIngredient
    extra = 1
    autocomplete_fields = ['gisement']
    min_num = 1
    verbose_name = "Gisement utilisé"
    verbose_name_plural = "Composition du mélange"



csrf_protect_m = method_decorator(csrf_protect)

@admin.register(Melange)
class MelangeAdmin(admin.ModelAdmin):
    list_display = (
        'reference_produit',
        'ingredients_affiches',
        'nom',
        'etat_display',
        'tache_display',
        'avancer_button',
    )
    readonly_fields = ['ingredients_affiches', 'tache_actuelle_display']
    inlines = [MelangeIngredientInline]

   

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:melange_id>/avancer/',
                self.admin_site.admin_view(self.avancer_view),
                name='core_melange_avancer',
            ),
        ]
        return custom_urls + urls

    @csrf_protect_m
    def avancer_view(self, request, melange_id):
        melange = Melange.objects.get(pk=melange_id)
        if melange.etat < Melange.Etat.VALIDATION:
            melange.etat += 1
            melange.save()
            messages.success(request, f"Le mélange {melange.reference_produit} a été avancé à l’étape suivante.")
            if melange.tache_actuelle():
                messages.info(request, f"Tâche à effectuer : {melange.tache_actuelle()}")
        else:
            messages.warning(request, "Ce mélange est déjà validé.")
        return redirect(f'/admin/core/melange/')

    def etat_display(self, obj):
        return obj.get_etat_display()
    
    def tache_display(self, obj):
        return obj.tache_actuelle() or "-"
    tache_display.short_description = "Tâche à faire"

    def tache_actuelle_display(self, obj):
        return format_html('<span id="id_tache_actuelle">{}</span>', obj.tache_actuelle() or "-")
    tache_actuelle_display.short_description = "Tâche actuelle"

    def avancer_button(self, obj):
        if obj.etat < obj.Etat.VALIDATION:
            return format_html(
                '<a class="button" style="color:white; background-color:#28a745; padding:4px 8px; border-radius:4px;" href="{}">Avancer</a>',
                f'/admin/core/melange/{obj.pk}/avancer/'
            )
        return "✅ Validé"
    avancer_button.short_description = 'Avancer l’état'

    def ingredients_affiches(self, obj):
        return format_html("<br>".join([
            f"{ingredient.gisement.nom} ({ingredient.pourcentage}%)"
            for ingredient in obj.ingredients.all()
        ]))
    ingredients_affiches.short_description = "Composition du mélange"


# ───────────── Admins ─────────────
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'company_name', 'role', 'email', 'is_active', 'date_joined', 'is_staff', 'is_superuser')
    list_filter = ('role',)

@admin.register(Chantier)
class ChantierAdmin(admin.ModelAdmin):
    list_display = ('nom', 'maitre_ouvrage', 'entreprise_terrassement')

@admin.register(Gisement)
class GisementAdmin(admin.ModelAdmin):
    list_display = ('id','commune', 'nom', 'periode_terrassement', 'volume_terrasse')
    list_filter = ('type_de_sol','commune', 'periode_terrassement')
    search_fields = ('nom', 'commune', 'chantier__nom')

    list_per_page = 10

@admin.register(AmendementOrganique)
class EmendentOrganique(admin.ModelAdmin):
    list_display = ('fournisseur', 'date_reception', 'volume_disponible')




@admin.register(ProduitVente)
class ProduitVenteAdmin(admin.ModelAdmin):
    list_display = ('reference_produit', 'volume_disponible', 'volume_vendu')

    readonly_fields = ('utilisateur',)

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.utilisateur = request.user
        super().save_model(request, obj, form, change)
    

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
    readonly_fields = ('responsable',)


@admin.register(MelangeIngredient)
class MelangeIngredientAdmin(admin.ModelAdmin):
    list_display = ('melange', 'gisement', 'pourcentage')

@admin.register(MelangeAmendement)
class MelangeAmendementAdmin(admin.ModelAdmin):
    list_display = ('melange', 'amendementOrganique', 'pourcentage')

class DocumentProduitVenteAdminForm(forms.ModelForm):
    class Meta:
        model = DocumentProduitVente
        fields = ['produit', 'type_document', 'fichier', 'remarque']
       

@admin.register(DocumentProduitVente)
class DocumentProduitVenteAdmin(admin.ModelAdmin):
    list_display = ('produit', 'fichier', 'date_ajout')
    search_fields = ('produit__reference_produit', 'fichier')
    list_filter = ('produit__reference_produit', 'date_ajout')
    ordering = ('-date_ajout',)

    form = DocumentProduitVenteAdminForm

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # on ajoute l'attribut 'multiple' manuellement sur le champ fichier
        form.base_fields['fichier'].widget.attrs.update({'multiple': True})
        return form

    def save_model(self, request, obj, form, change):
        fichiers = request.FILES.getlist('fichier')
        for fichier in fichiers:
            DocumentProduitVente.objects.create(
                produit=form.cleaned_data['produit'],
                type_document=form.cleaned_data['type_document'],
                fichier=fichier,
                remarque=form.cleaned_data['remarque']
        )

@admin.register(SaisieVente)
class SaisieVenteAdmin(admin.ModelAdmin):
    list_display = ('produit', 'responsable', 'date_achat', 'volume_tonne')
    search_fields = ('produit__reference_produit', 'responsable__username')
    list_filter = ('responsable__role',)
    ordering = ('-date_achat',)

    readonly_fields = ('responsable',)

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.responsable = request.user
        super().save_model(request, obj, form, change)


@admin.register(ChantierRecepteur)
class ChantierRecepteurAdmin(admin.ModelAdmin):
    list_display = (
        'nom',
        'adresse',
        'date_creation',
    
    )

    search_fields = ('nom', 'adresse', 'date_creation')
    list_filter = ('nom', 'adresse', 'date_creation')


@admin.register(Planning)
class PlanningAdmin(admin.ModelAdmin):
    list_display = ('titre', 'date_debut', 'duree_jours', 'statut', 'melange_nom')
    search_fields = ('titre', 'melange__nom')
    list_filter = ('statut', 'date_debut')
    readonly_fields = ('melange_nom',)

    def melange_nom(self, obj):
        return obj.melange.nom if obj.melange else "N/A"
    melange_nom.short_description = "Mélange associé"

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.responsable = request.user
        super().save_model(request, obj, form, change)