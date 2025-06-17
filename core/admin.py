from django.contrib import messages as messages
from django.shortcuts import redirect
from django.utils.html import format_html  
from django.urls import path

from django.contrib import admin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect


from .models import (
    CustomUser, Chantier, DocumentGisement, Gisement, Compost, Plateforme,
    Melange, ProduitVente, DocumentTechnique, AnalyseLaboratoire, MelangeIngredient
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
        'plateforme',
        'etat_display',
        'tache_display',
        'avancer_button',
    )
    readonly_fields = ['ingredients_affiches', 'tache_actuelle_display']
    inlines = [MelangeIngredientInline]
   





    class Media:
        js = ['admin/js/melange_etapes.js']

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
    list_display = ('username', 'company_name', 'role', 'email')
    list_filter = ('role',)

@admin.register(Chantier)
class ChantierAdmin(admin.ModelAdmin):
    list_display = ('nom', 'maitre_ouvrage', 'entreprise_terrassement')

@admin.register(Gisement)
class GisementAdmin(admin.ModelAdmin):
    list_display = ('commune', 'nom', 'periode_terrassement', 'volume_terrasse')
    list_filter = ('type_de_sol','commune', 'periode_terrassement')
    search_fields = ('nom', 'commune', 'chantier__nom')

    list_per_page = 10

@admin.register(Compost)
class CompostAdmin(admin.ModelAdmin):
    list_display = ('fournisseur', 'date_reception', 'volume')




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
