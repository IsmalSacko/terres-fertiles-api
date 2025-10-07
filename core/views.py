import io
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Prefetch, Q, F, Case, When
from django.db import models
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework import status   
from rest_framework.response import Response  # ✅ BON import
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from django_filters.rest_framework import DjangoFilterBackend
import re
import fitz  # PyMuPDF
from rest_framework import viewsets, permissions, generics

from core.utils import HasCustomAccessPermission, IsClientOrEntrepriseOrStaffOrSuperuser
from .models import (
    ChantierRecepteur, CustomUser, Chantier, DocumentGisement, DocumentProduitVente, Gisement, AmendementOrganique,
    Melange, MelangeAmendement, MelangeIngredient, Planning, Plateforme, ProduitVente, DocumentTechnique, AnalyseLaboratoire, SaisieVente, SuiviStockPlateforme
)
from .serializers import (
    AmendementOrganiqueSerializer, CustomUserSerializer, ChantierSerializer, DocumentGisementSerializer, DocumentProduitVenteSerializer, GisementSerializer, MelangeAmendementSerializer, MelangeIngredientSerializer,
    MelangeSerializer, PlanningSerializer, PlateformeSerializer, ProduitVenteCreateSerializer, ProduitVenteDetailSerializer, DocumentTechniqueSerializer, AnalyseLaboratoireSerializer, SaisieVenteSerializer, ChantierRecepteurSerializer, SuiviStockPlateformeSerializer, SuiviStockPlateformeCreateSerializer
)



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
    queryset = Chantier.objects.all()
    serializer_class = ChantierSerializer
    permission_classes = [permissions.IsAuthenticated]


# Vues pour le modèle DocumentGisement (gestion des documents liés aux gisements)   
class DocumentGisementViewSet(viewsets.ModelViewSet):
    queryset = DocumentGisement.objects.all()
    serializer_class = DocumentGisementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend] # Add this line
    filterset_fields = ['gisement']

# Vues pour le modèle Gisement (gestion des gisements)
class GisementViewSet(viewsets.ModelViewSet):
    queryset = Gisement.objects.all()
    serializer_class = GisementSerializer
    permission_classes = [permissions.AllowAny]


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


class AnalyseLaboratoireViewSet(viewsets.ModelViewSet):
    queryset = AnalyseLaboratoire.objects.all()
    serializer_class = AnalyseLaboratoireSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)




class PlateformeViewSet(viewsets.ModelViewSet):
    queryset = Plateforme.objects.all()
    serializer_class = PlateformeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(responsable=self.request.user)





class AnalysePdfParseView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('fichier_pdf')

        if not file_obj:
            return Response({'error': 'Aucun fichier PDF fourni.'}, status.HTTP_400_BAD_REQUEST)

        try:
            pdf_stream = io.BytesIO(file_obj.read())
            doc = fitz.open(stream=pdf_stream, filetype='pdf')

            texte = ""
            for page in doc:
                texte += page.get_text("text")
            doc.close()

            # Fonction améliorée pour détecter des valeurs même sur plusieurs lignes ou avec espaces irréguliers
            def extract_value(text, label_pattern, value_group=1):
                pattern = rf"{re.escape(label_pattern)}[\s:=]*([-+]?\d+[\.,]?\d*)"
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    try:
                        return float(match.group(value_group).replace(',', '.'))
                    except ValueError:
                        return None
                return None

            def extract_any(text, labels):
                for label in labels:
                    value = extract_value(text, label)
                    if value is not None:
                        return value
                return None

            data = {
                'cec': extract_any(texte, ["CEC (meq /kg)", "CEC"]),
                'saturation': extract_any(texte, ["Saturation (%)", "Saturation"]),
                'ph_eau': extract_any(texte, ["pH eau"]),
                'ph_kcl': extract_any(texte, ["pH KCl", "pH KCl acidité de réserve"]),
                'calcaire_total': extract_any(texte, ["Calcaire total (g/Kg)", "Calcaire total"]),
                'calcaire_actif': extract_any(texte, ["Calcaire actif (g/Kg)", "Calcaire actif"]),

                'matiere_organique': extract_any(texte, ["Matières organiques (g/Kg)", "Matières organiques"]),
                'azote_total': extract_any(texte, ["Azote N organique (g/Kg)", "Azote organique"]),
                'c_n': extract_any(texte, ["C/N", "C/N (Corg / N org)"]),
                'iam': extract_any(texte, ["IAM", "intensité d'activité microbienne"]),

                'conductivite': extract_any(texte, ["Conductivité (mS/cm)", "Conductivité"]),
                'phosphore': extract_any(texte, ["Phosphore P2O5 Joret (g/Kg)", "P205"]),
                'potassium': extract_any(texte, ["Potassium K2O (g/Kg)", "K2O"]),
                'magnesium': extract_any(texte, ["Magnésium MgO (g/Kg)", "MgO"]),
                'calcium': extract_any(texte, ["Calcium CaO (g/Kg)", "CaO"]),
                'k2o_mgo': extract_any(texte, ["K2O/MgO"]),

                'fer': extract_any(texte, ["Fer (mg/Kg)", "Fer"]),
                'cuivre': extract_any(texte, ["Cuivre (mg/Kg)", "Cu"]),
                'zinc': extract_any(texte, ["Zinc (mg/Kg)", "Zn"]),
                'manganese': extract_any(texte, ["Manganèse (mg/Kg)", "Manganese"]),

                'argile': extract_any(texte, ["Argiles %", "Argile"]),
                'limons_fins': extract_any(texte, ["Limons fins %"]),
                'limons_grossiers': extract_any(texte, ["Limons grossiers %"]),
                'sables_fins': extract_any(texte, ["Sables fins %"]),
                'sables_grossiers': extract_any(texte, ["Sables grossiers %"]),

                'refus_gravier_2mm': extract_any(texte, ["Refus gravier (%)", "Refus gravier (%) 2 à 5 mm"]),
                'indice_risque_battance': extract_any(texte, ["Indice ou risque de battance", "Indice risque de battance"]),
                'rfu': extract_any(texte, ["RFUL/M2", "RFU L/M2"]),
            }

            print(f'Les champs pré remplis sont : {data}')
            return Response(data, status.HTTP_200_OK)

        except fitz.FileDataError:
            return Response({'error': 'Le fichier fourni n\'est pas un PDF valide ou est corrompu.'}, status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Erreur interne lors de l'analyse du PDF : {e}")
            return Response({'error': f'Une erreur est survenue lors de l\'analyse du fichier PDF: {e}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        reset_link = f"http://localhost:4200/reset-password-confirm/{uid}/{token}"

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


class SuiviStockPlateformeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour le suivi de stock des plateformes
    Inclut des actions personnalisées pour les opérations spécifiques
    """
    queryset = SuiviStockPlateforme.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['plateforme', 'melange', 'statut', 'utilisateur']
    
    def get_serializer_class(self):
        """Utiliser différents serializers selon l'action"""
        if self.action == 'create':
            return SuiviStockPlateformeCreateSerializer
        return SuiviStockPlateformeSerializer
    
    def get_queryset(self):
        """Optimiser les requêtes avec select_related et prefetch_related"""
        queryset = SuiviStockPlateforme.objects.select_related(
            'plateforme', 'melange', 'produit_vente', 'utilisateur'
        ).order_by('-date_creation')
        
        # Filtres personnalisés
        plateforme_id = self.request.query_params.get('plateforme', None)
        melange_id = self.request.query_params.get('melange', None)
        statut = self.request.query_params.get('statut', None)
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        search = self.request.query_params.get('search', None)
        
        if plateforme_id:
            try:
                plateforme_id = int(plateforme_id)
                queryset = queryset.filter(plateforme_id=plateforme_id)
            except ValueError:
                pass  # Ignorer les valeurs non-entières
        
        if melange_id:
            try:
                melange_id = int(melange_id)
                queryset = queryset.filter(melange_id=melange_id)
            except ValueError:
                pass  # Ignorer les valeurs non-entières
        
        if statut:
            queryset = queryset.filter(statut=statut)
        
        if date_debut:
            queryset = queryset.filter(date_mise_en_andains__gte=date_debut)
        
        if date_fin:
            queryset = queryset.filter(date_mise_en_andains__lte=date_fin)
        
        if search:
            queryset = queryset.filter(
                Q(reference_suivi__icontains=search) |
                Q(plateforme__nom__icontains=search) |
                Q(melange__nom__icontains=search) |
                Q(recette__icontains=search) |
                Q(remarques__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Associer l'utilisateur connecté lors de la création"""
        serializer.save(utilisateur=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='marquer-ecoule')
    def marquer_ecoule(self, request):
        """
        Action pour marquer des andains comme écoulés (en lot)
        Body: {"ids": [1, 2, 3]}
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'Aucun ID fourni'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les objets existants
        suivis = self.get_queryset().filter(id__in=ids)
        count = 0
        
        for suivi in suivis:
            if suivi.statut != 'ecoule':
                suivi.statut = 'ecoule'
                suivi.volume_restant_m3 = 0
                suivi.date_ecoulement = timezone.now().date()
                suivi.save()
                count += 1
        
        return Response({
            'message': f'{count} andain(s) marqué(s) comme écoulé(s)',
            'count': count
        })
    
    @action(detail=False, methods=['post'], url_path='marquer-pret-vente')
    def marquer_pret_vente(self, request):
        """
        Action pour marquer des andains comme prêts pour vente (en lot)
        Body: {"ids": [1, 2, 3]}
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'Aucun ID fourni'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = self.get_queryset().filter(
            id__in=ids, 
            statut__in=['en_cours', 'en_culture']
        ).update(statut='pret_vente')
        
        return Response({
            'message': f'{count} andain(s) marqué(s) comme prêt pour vente',
            'count': count
        })
    
    @action(detail=False, methods=['post'], url_path='exporter-csv')
    def exporter_csv(self, request):
        """
        Exporter les suivis de stock en CSV
        Body optionnel: {"ids": [1, 2, 3]} pour export sélectif
        """
        import csv
        from django.http import HttpResponse
        
        ids = request.data.get('ids', [])
        
        if ids:
            queryset = self.get_queryset().filter(id__in=ids)
        else:
            queryset = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="suivi_stock_plateforme.csv"'
        
        # BOM pour Excel
        response.write('\ufeff'.encode('utf8'))
        
        writer = csv.writer(response)
        writer.writerow([
            'Andain', 'Référence', 'Plateforme', 'Mélange', 
            'Volume initial (m³)', 'Volume restant (m³)', 'Volume écoulé (m³)',
            'Taux écoulement (%)', 'Statut', 'Date mise en andains',
            'Date mise en culture', 'Date prév. vente', 'Date écoulement',
            'Recette', 'Remarques', 'Responsable', 'Date création'
        ])
        
        for obj in queryset:
            writer.writerow([
                obj.andain_numero,
                obj.reference_suivi,
                obj.plateforme.nom if obj.plateforme else '',
                obj.melange.nom if obj.melange else '',
                obj.volume_initial_m3,
                obj.volume_restant_m3,
                obj.volume_ecoule_m3 or 0,
                obj.taux_ecoulement_percent or 0,
                obj.get_statut_display(),
                obj.date_mise_en_andains or '',
                obj.date_mise_en_culture or '',
                obj.date_previsionnelle_vente or '',
                obj.date_ecoulement or '',
                obj.recette or '',
                obj.remarques or '',
                obj.utilisateur.username if obj.utilisateur else '',
                obj.date_creation.strftime('%Y-%m-%d %H:%M') if obj.date_creation else ''
            ])
        
        return response
    
    @action(detail=False, methods=['get'], url_path='verifier-andain')
    def verifier_andain(self, request):
        """
        Vérifier si un numéro d'andain est disponible sur une plateforme
        Query params: plateforme, andain_numero, exclude_id (optionnel)
        """
        plateforme_id = request.query_params.get('plateforme')
        andain_numero = request.query_params.get('andain_numero')
        exclude_id = request.query_params.get('exclude_id')
        
        if not plateforme_id or not andain_numero:
            return Response(
                {'error': 'Les paramètres plateforme et andain_numero sont requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            plateforme_id = int(plateforme_id)
            andain_numero = int(andain_numero)
        except ValueError:
            return Response(
                {'error': 'Les paramètres doivent être des entiers'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = SuiviStockPlateforme.objects.filter(
            plateforme_id=plateforme_id,
            andain_numero=andain_numero
        )
        
        if exclude_id:
            try:
                exclude_id = int(exclude_id)
                queryset = queryset.exclude(id=exclude_id)
            except ValueError:
                pass
        
        existing = queryset.first()
        
        if existing:
            return Response({
                'disponible': False,
                'message': f'Un andain avec le numéro {andain_numero} existe déjà sur cette plateforme',
                'existant': {
                    'id': existing.id,
                    'reference_suivi': existing.reference_suivi,
                    'melange_nom': existing.melange.nom if existing.melange else None,
                    'statut': existing.get_statut_display()
                }
            })
        
        return Response({
            'disponible': True,
            'message': f'Le numéro d\'andain {andain_numero} est disponible sur cette plateforme'
        })
    
    @action(detail=False, methods=['get'], url_path='statistiques')
    def statistiques(self, request):
        """
        Obtenir des statistiques sur les suivis de stock
        Query param optionnel: plateforme
        """
        from django.db.models import Sum, Avg, Count, Case, When, IntegerField
        
        plateforme_id = request.query_params.get('plateforme')
        queryset = self.get_queryset()
        
        if plateforme_id:
            try:
                plateforme_id = int(plateforme_id)
                queryset = queryset.filter(plateforme_id=plateforme_id)
            except ValueError:
                pass  # Ignorer les valeurs non-entières
        
        # Statistiques générales
        stats = queryset.aggregate(
            total_andains=Count('id'),
            volume_total_initial=Sum('volume_initial_m3'),
            volume_total_restant=Sum('volume_restant_m3'),
            taux_ecoulement_moyen=Avg(
                Case(
                    When(volume_initial_m3__gt=0, 
                         then=((F('volume_initial_m3') - F('volume_restant_m3')) * 100.0 / F('volume_initial_m3'))),
                    default=0,
                    output_field=models.FloatField()
                )
            )
        )
        
        # Répartition par statut
        repartition_statuts = {}
        for statut_value, statut_label in SuiviStockPlateforme.STATUT_CHOICES:
            count = queryset.filter(statut=statut_value).count()
            repartition_statuts[statut_value] = count
        
        # Évolution par mois (derniers 12 mois)
        from datetime import datetime, timedelta
        from django.db.models.functions import TruncMonth
        
        date_limite = datetime.now().date() - timedelta(days=365)
        
        andains_par_mois = (
            queryset.filter(date_mise_en_andains__gte=date_limite)
            .annotate(mois=TruncMonth('date_mise_en_andains'))
            .values('mois')
            .annotate(count=Count('id'))
            .order_by('mois')
        )
        
        # Formater les données par mois
        mois_data = {}
        for item in andains_par_mois:
            if item['mois']:
                mois_key = item['mois'].strftime('%Y-%m')
                mois_data[mois_key] = item['count']
        
        return Response({
            'total_andains': stats['total_andains'] or 0,
            'volume_total_initial': float(stats['volume_total_initial'] or 0),
            'volume_total_restant': float(stats['volume_total_restant'] or 0),
            'taux_ecoulement_moyen': round(float(stats['taux_ecoulement_moyen'] or 0), 2),
            'repartition_statuts': repartition_statuts,
            'andains_par_mois': mois_data
        })