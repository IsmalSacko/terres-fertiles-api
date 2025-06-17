from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserViewSet,
      ChantierViewSet,
     GisementViewSet, 
     CompostViewSet,
    MelangeViewSet, 
    ProduitVenteViewSet, 
    DocumentTechniqueViewSet, 
    AnalyseLaboratoireViewSet,
    AnalysePdfParseView,
    DocumentGisementViewSet,
    PlateformeViewSet
)

router = DefaultRouter()
router.register(r'auth/users', CustomUserViewSet)
router.register(r'chantiers', ChantierViewSet)
router.register(r'gisements', GisementViewSet)
router.register(r'composts', CompostViewSet)
router.register(r'melanges', MelangeViewSet, basename='melanges')  # basename pour éviter les conflits de noms

router.register(r'produits', ProduitVenteViewSet)
router.register(r'documents-techniques', DocumentTechniqueViewSet)
router.register(r'analyses-laboratoire', AnalyseLaboratoireViewSet)
router.register(r'documents-gisements', DocumentGisementViewSet)
router.register(r'plateformes', PlateformeViewSet)


urlpatterns = [
    path('auth/', include('djoser.urls')),  # gestion utilisateurs
    path('auth/', include('djoser.urls.authtoken')),  # authentification token
    path('auth/', include('rest_framework.urls')),  # navigateur DRF
    path('analyse-pdf-parse/', AnalysePdfParseView.as_view(), name='analyse_pre_remplir'),
    path('', include(router.urls)),  # toutes les routes des modèles
]



