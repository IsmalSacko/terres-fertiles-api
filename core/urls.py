from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    next_eap,
    CurrentUserView,
    CustomUserViewSet,
    ChantierViewSet,
    DocumentProduitVenteViewSet,
    GisementViewSet, 
    AmendementOrganiqueViewSet,
    MelangeAmendementViewSet,
    MelangeViewSet,
    PlanningViewSet, 
    ProduitVenteViewSet, 
    DocumentTechniqueViewSet, 
    AnalyseLaboratoireViewSet,
    AnalysePdfParseView,
    DocumentGisementViewSet,
    PlateformeViewSet,
    SaisieVenteViewSet,
    ChantierRecepteurViewSet,
    SuiviStockPlateformeViewSet,
    FicheAgroPedodeSolViewSet,
    FicheHorizonViewSet,
    FichePhotoViewSet,
    custom_reset_password,
    reset_password_confirm,
)

router = DefaultRouter()
router.register(r'auth/users', CustomUserViewSet)
router.register(r'chantiers', ChantierViewSet)
router.register(r'gisements', GisementViewSet)
router.register(r'amendements-organiques', AmendementOrganiqueViewSet, basename='amendements-organique')  # basename pour éviter les conflits de noms
router.register(r'melange-amendements', MelangeAmendementViewSet, basename='melange-amendement')
router.register(r'melanges', MelangeViewSet, basename='melanges')  # basename pour éviter les conflits de noms
router.register(r'produits', ProduitVenteViewSet)
router.register(r'documents-techniques', DocumentTechniqueViewSet)
router.register(r'documents-produits-vente', DocumentProduitVenteViewSet, basename='documents-produits-vente')  # basename pour éviter les conflits de noms
router.register(r'analyses-laboratoire', AnalyseLaboratoireViewSet)
router.register(r'documents-gisements', DocumentGisementViewSet)
router.register(r'plateformes', PlateformeViewSet)
router.register(r'plannings', PlanningViewSet)
router.register(r'saisies-vente', SaisieVenteViewSet)
router.register(r'chantiers-recepteurs', ChantierRecepteurViewSet)
router.register(r'suivi-stock-plateforme', SuiviStockPlateformeViewSet)
router.register(r'fiches-agro', FicheAgroPedodeSolViewSet)
router.register(r'fiches-horizons', FicheHorizonViewSet)
router.register(r'fiches-photos', FichePhotoViewSet)



urlpatterns = [
    path('auth/', include('djoser.urls')),  # gestion utilisateurs
    path('auth/', include('djoser.urls.authtoken')),  # authentification token
    path('auth/', include('rest_framework.urls')),  # navigateur DRF
    path('analyse-pdf-parse/', AnalysePdfParseView.as_view(), name='analyse_pre_remplir'),
    path('', include(router.urls)),  # toutes les routes des modèles
    path('user/me/', CurrentUserView.as_view(), name='current_user'),  # pour récupérer l'utilisateur courant
    path('users/custom-reset-password/', custom_reset_password, name='custom_reset_password'),
    path('users/reset-password-confirm/', reset_password_confirm),
    path('fiche-agropedodesol/next-eap/', next_eap, name='next_eap'),

]




