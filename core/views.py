import io
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response  # ✅ BON import
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from django_filters.rest_framework import DjangoFilterBackend
import re
import fitz  # PyMuPDF
from rest_framework import viewsets, permissions
from .models import (
    CustomUser, Chantier, DocumentGisement, Gisement, Compost,
    Melange, MelangeIngredient, Plateforme, ProduitVente, DocumentTechnique, AnalyseLaboratoire
)
from .serializers import (
    CustomUserSerializer, ChantierSerializer, DocumentGisementSerializer, GisementSerializer, CompostSerializer,
    MelangeSerializer, PlateformeSerializer, ProduitVenteSerializer, DocumentTechniqueSerializer, AnalyseLaboratoireSerializer
)


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ChantierViewSet(viewsets.ModelViewSet):
    queryset = Chantier.objects.all()
    serializer_class = ChantierSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class DocumentGisementViewSet(viewsets.ModelViewSet):
    queryset = DocumentGisement.objects.all()
    serializer_class = DocumentGisementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend] # Add this line
    filterset_fields = ['gisement']

class GisementViewSet(viewsets.ModelViewSet):
    queryset = Gisement.objects.all()
    serializer_class = GisementSerializer
    permission_classes = [permissions.IsAuthenticated]


class CompostViewSet(viewsets.ModelViewSet):
    queryset = Compost.objects.all()
    serializer_class = CompostSerializer
    permission_classes = [permissions.IsAuthenticated]


# class MelangeViewSet(viewsets.ModelViewSet):
#     queryset = Melange.objects.all()
#     serializer_class = MelangeSerializer
#     permission_classes = [permissions.IsAuthenticated]
@method_decorator(csrf_exempt, name="dispatch")
class MelangeViewSet(viewsets.ModelViewSet):
    """
    CRUD complet + action POST /{pk}/avancer/ pour passer à l'étape suivante.
    """
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


class ProduitVenteViewSet(viewsets.ModelViewSet):
    queryset = ProduitVente.objects.all()
    serializer_class = ProduitVenteSerializer
    permission_classes = [permissions.IsAuthenticated]


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




from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import fitz
import io
import re

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
