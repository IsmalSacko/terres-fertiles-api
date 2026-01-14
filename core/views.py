import logging
from rest_framework.parsers import MultiPartParser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Prefetch
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework import status 
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import viewsets, permissions, generics
from core.filters import ChantierFilter, GisementFilter, MelangeFilter
from core.models import FicheAgroPedodeSol
from core.utils import HasCustomAccessPermission, IsClientOrEntrepriseOrStaffOrSuperuser, build_absolute_link
from .models import (
    ChantierRecepteur, CustomUser, Chantier, DocumentGisement, DocumentProduitVente, FicheAgroPedodeSol, FicheHorizon, FichePhoto, Gisement, AmendementOrganique,
    Melange, MelangeAmendement, MelangeIngredient, Planning, Plateforme, ProduitVente, DocumentTechnique, SaisieVente,
    MelangeDocument, Stock,
   
)
from .serializers import (
    AmendementOrganiqueSerializer, CustomUserSerializer, ChantierSerializer, DocumentGisementSerializer, 
    DocumentProduitVenteSerializer, FicheAgroPedodeSolSerializer, FicheHorizonSerializer, FichePhotoSerializer, 
    GisementSerializer, MelangeAmendementSerializer, MelangeIngredientSerializer,ChantierRecepteurSerializer,
    MelangeSerializer, PlanningSerializer, PlateformeSerializer, ProduitVenteCreateSerializer, 
    ProduitVenteDetailSerializer, DocumentTechniqueSerializer, SaisieVenteSerializer, 
    MelangeDocumentSerializer, StockageSerializer,
    
)

logger = logging.getLogger(__name__)



@api_view(['GET'])
def next_eap(request):
    ville = request.GET.get('ville', '').strip()
    ville_code = ville.upper().replace("'", "").replace(" ", "-")[:3] if ville else 'XXX'
    # Récupère tous les EAP existants pour la ville
    eaps = FicheAgroPedodeSol.objects.filter(ville__iexact=ville, EAP__startswith=f"EAP-25-{ville_code}-", EAP__isnull=False).values_list('EAP', flat=True)
    nums = []
    for eap in eaps:
        try:
            num = int(eap.split('-')[-1])
            nums.append(num)
        except Exception:
            continue
    next_num = max(nums) + 1 if nums else 1
    next_eap = f"EAP-25-{ville_code}-{next_num:03d}"
    return Response({"next_eap": next_eap})


# View pour récupérer l'utilisateur courant
class CurrentUserView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Vues le modèle CustomUser (gestion des utilisateurs)
class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
  


# Vues pour le modèle Chantier (gestion des chantiers)

class ChantierViewSet(viewsets.ModelViewSet):
    # on filtre pour affhier les derniers chantiers en premier
    queryset = Chantier.objects.all().order_by('-date_creation')
    serializer_class = ChantierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ChantierFilter


# Vues pour le modèle DocumentGisement (gestion des documents liés aux gisements)   
class DocumentGisementViewSet(viewsets.ModelViewSet):
    queryset = DocumentGisement.objects.all()
    serializer_class = DocumentGisementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend] # Add this line
    filterset_fields = ['gisement']


# ViewSet pour gérer les documents multiples d'un mélange
class MelangeDocumentViewSet(viewsets.ModelViewSet):
    queryset = MelangeDocument.objects.all()
    serializer_class = MelangeDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['melange', 'type_document']

    def perform_create(self, serializer):
        # Associer l'utilisateur courant
        serializer.save(utilisateur=self.request.user)

# Vues pour le modèle Gisement (gestion des gisements)
class GisementViewSet(viewsets.ModelViewSet):
    queryset = Gisement.objects.all()
    serializer_class = GisementSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = GisementFilter




# Vues pour le modèle AmendementOrganique (gestion des amendements organiques)
class AmendementOrganiqueViewSet(viewsets.ModelViewSet):
    queryset = AmendementOrganique.objects.all()
    serializer_class = AmendementOrganiqueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(responsable=self.request.user)

# Vues pour le modèle MelangeAmendement (gestion des amendements dans les mélanges)
class MelangeAmendementViewSet(viewsets.ModelViewSet):
    queryset = MelangeAmendement.objects.all()
    serializer_class = MelangeAmendementSerializer
    permission_classes = [permissions.IsAuthenticated]


# Vues pour le modèle Melange (gestion des mélanges)
@method_decorator(csrf_exempt, name="dispatch")
class MelangeViewSet(viewsets.ModelViewSet):
  
    serializer_class = MelangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MelangeFilter
   

    # → on pré-charge les ingrédients pour éviter le N+1
    def get_queryset(self):
        return (
            Melange.objects.select_related("plateforme").prefetch_related(Prefetch("ingredients",  # related_name dans le modèle
            queryset=MelangeIngredient.objects.select_related("gisement"))
            )
        )

    # ---------- action métier : avancer l'état ----------
    @action(detail=True, methods=["post"])
    @csrf_exempt
    def avancer(self, request, pk=None):
        melange = self.get_object()
        if melange.etat < Melange.Etat.VALIDATION:   # adapte si tu as renommé la classe
            melange.etat += 1
            melange.save()
            return Response(self.get_serializer(melange).data, status=status.HTTP_200_OK)
        return Response(
            {"detail": "Mélange déjà validé."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---------- AJOUTEZ CETTE ACTION ----------
    @action(detail=True, methods=["post"], url_path="ingredients")
    @csrf_exempt
    def ingredients(self, request, pk=None):
        """Ajouter plusieurs ingrédients au mélange"""
        try:
            melange = self.get_object()
            ingredients_data = request.data.get('ingredients', [])
            
            if not ingredients_data:
                return Response(
                    {'error': 'ingredients est requis'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            created_ingredients = []
            
            for ingredient_data in ingredients_data:
                ingredient = MelangeIngredient.objects.create(
                    melange=melange,
                    gisement_id=ingredient_data['gisement'],
                    pourcentage=ingredient_data['pourcentage']
                )
                created_ingredients.append(ingredient)
            
            serializer = MelangeIngredientSerializer(created_ingredients, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)


# Vues pour le modéle de ProduitVente (gestion des produits de vente)
class ProduitVenteViewSet(viewsets.ModelViewSet):
    queryset = ProduitVente.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.action == 'create':
            return ProduitVenteCreateSerializer
        return ProduitVenteDetailSerializer

    def perform_create(self, serializer):
        serializer.save(utilisateur=self.request.user)


class DocumentTechniqueViewSet(viewsets.ModelViewSet):
    queryset = DocumentTechnique.objects.all()
    serializer_class = DocumentTechniqueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)






class PlateformeViewSet(viewsets.ModelViewSet):
    queryset = Plateforme.objects.all()
    serializer_class = PlateformeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(responsable=self.request.user)



@api_view(['POST'])
@permission_classes([AllowAny])
def custom_reset_password(request):
    email = request.data.get('email')

    if not email:
        return Response({'error': 'Adresse email requise.'}, status=400)

    try:
        user = get_user_model().objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        #reset_link = f"http://localhost:4200/reset-password-confirm/{uid}/{token}"
        reset_link = build_absolute_link(f"reset-password-confirm/{uid}/{token}")

        context = {
            'user': user,
            'reset_link': reset_link
        }

        html_message = render_to_string('core/emails/password_reset.html', context)

        send_mail(
            subject='Réinitialisation de votre mot de passe - Terres Fertiles',
            message='Voici le lien pour réinitialiser votre mot de passe.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message
        )

        return Response({'detail': 'Email de réinitialisation envoyé.'})

    except get_user_model().DoesNotExist:
        return Response({'error': 'Aucun utilisateur avec cet email.'}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    from django.utils.http import urlsafe_base64_decode
    from django.contrib.auth.tokens import default_token_generator

    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    try:
        uid = urlsafe_base64_decode(uid).decode()
        user = get_user_model().objects.get(pk=uid)
    except Exception:
        return Response({"detail": "Lien invalide."}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"detail": "Token invalide ou expiré."}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"detail": "Mot de passe mis à jour avec succès."})





class DocumentProduitVenteViewSet(viewsets.ModelViewSet):
    queryset = DocumentProduitVente.objects.all()
    serializer_class = DocumentProduitVenteSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), HasCustomAccessPermission()]

    def create(self, request, *args, **kwargs):
        fichiers = request.FILES.getlist('fichier')  # plusieurs fichiers sous clé 'fichier'
        produit_id = request.data.get('produit')
        type_document = request.data.get('type_document')
        remarque = request.data.get('remarque', '')

        documents_crees = []
        for fichier in fichiers:
            doc = DocumentProduitVente.objects.create(
                produit_id=produit_id,
                type_document=type_document,
                fichier=fichier,
                remarque=remarque
            )
            documents_crees.append(doc)

        serializer = self.get_serializer(documents_crees, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)




class SaisieVenteViewSet(viewsets.ModelViewSet):
    queryset = SaisieVente.objects.all()
    serializer_class = SaisieVenteSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        # Option 1: Si le produit doit être fourni dans la requête
        produit_id = self.request.data.get('produit')
        if not produit_id:
            raise ValueError("Le champ 'produit' est requis")
        
        serializer.save(responsable=self.request.user, produit_id=produit_id)



    # pour la modification
    def perform_update(self, serializer):
        produit_id = self.request.data.get('produit')
        if not produit_id:
            raise ValueError("Le champ 'produit' est requis")

        serializer.save(responsable=self.request.user, produit_id=produit_id) 




class PlanningViewSet(viewsets.ModelViewSet):
    queryset = Planning.objects.select_related("melange", "melange__plateforme").all()
    serializer_class = PlanningSerializer




class ChantierRecepteurViewSet(viewsets.ModelViewSet):
    queryset = ChantierRecepteur.objects.all()
    serializer_class = ChantierRecepteurSerializer
    
    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsClientOrEntrepriseOrStaffOrSuperuser()]   

    def perform_create(self, serializer):
        serializer.save(responsable=self.request.user)




# Vues pour le modèle FicheAgroPedodeSol (gestion des fiches agro-pédologiques)
class FicheAgroPedodeSolViewSet(viewsets.ModelViewSet):
    queryset = FicheAgroPedodeSol.objects.all()
    serializer_class = FicheAgroPedodeSolSerializer
    permission_classes = [permissions.IsAuthenticated]


# Vues pour le modèle FicheHorizon (gestion des horizons des fiches agro-pédologiques)
class FicheHorizonViewSet(viewsets.ModelViewSet):
    queryset = FicheHorizon.objects.all()
    serializer_class = FicheHorizonSerializer
    permission_classes = [permissions.IsAuthenticated]


# Vues pour le modèle FichePhoto (gestion des photos des fiches agro-pédologiques)
class FichePhotoViewSet(viewsets.ModelViewSet):
    queryset = FichePhoto.objects.all()
    serializer_class = FichePhotoSerializer
    permission_classes = [permissions.IsAuthenticated]


# Vues pour le stock de mélanges
class StockageViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all().order_by('-date_mise_en_stock')
    serializer_class = StockageSerializer
    permission_classes = [permissions.IsAuthenticated]