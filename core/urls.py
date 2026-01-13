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
    MelangeDocumentViewSet,
    PlanningViewSet, 
    ProduitVenteViewSet, 
    DocumentTechniqueViewSet, 
    DocumentGisementViewSet,
    PlateformeViewSet,
    SaisieVenteViewSet,
    ChantierRecepteurViewSet,
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
router.register(r'melange-documents', MelangeDocumentViewSet)
router.register(r'documents-produits-vente', DocumentProduitVenteViewSet, basename='documents-produits-vente')  # basename pour éviter les conflits de noms
router.register(r'documents-gisements', DocumentGisementViewSet)
router.register(r'plateformes', PlateformeViewSet)
router.register(r'plannings', PlanningViewSet)
router.register(r'saisies-vente', SaisieVenteViewSet, basename='saisies-vente')
router.register(r'chantiers-recepteurs', ChantierRecepteurViewSet)
router.register(r'fiches-agro', FicheAgroPedodeSolViewSet)
router.register(r'fiches-horizons', FicheHorizonViewSet)
router.register(r'fiches-photos', FichePhotoViewSet)



urlpatterns = [
    path('auth/', include('djoser.urls')),  # gestion utilisateurs
    path('auth/', include('djoser.urls.authtoken')),  # authentification token
    path('auth/', include('rest_framework.urls')),  # navigateur DRF
    path('', include(router.urls)),  # toutes les routes des modèles
    path('user/me/', CurrentUserView.as_view(), name='current_user'),  # pour récupérer l'utilisateur courant
    path('users/custom-reset-password/', custom_reset_password, name='custom_reset_password'),
    path('users/reset-password-confirm/', reset_password_confirm),
    path('fiche-agropedodesol/next-eap/', next_eap, name='next_eap'),

]




