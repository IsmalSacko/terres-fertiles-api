from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from decouple import config
from datetime import date, datetime

from rest_framework import serializers

from .models import (
    ChantierRecepteur, CustomUser, Chantier, DocumentGisement, DocumentProduitVente, Gisement, AmendementOrganique, MelangeAmendement, MelangeIngredient, Planning, Plateforme,
    Melange, SaisieVente, ProduitVente, DocumentTechnique, AnalyseLaboratoire
)
# ...existing code...

# Exemple d'un serializer ProduitVenteDetailSerializer avec sécurisation de l'accès à la plateforme
class ProduitVenteDetailSerializer(serializers.ModelSerializer):
    plateforme = serializers.SerializerMethodField()
    # ...existing code...

    def get_plateforme(self, obj):
        melange = getattr(obj, 'melange', None)
        plateforme = getattr(melange, 'plateforme', None) if melange else None
        if plateforme:
            return {
                'id': plateforme.id,
                'nom': plateforme.nom,
                'localisation': plateforme.localisation
            }
        return None



class CustomUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)

    class Meta:
        model = CustomUser
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'company_name',
            'siret_number',
            'address',
            'city',
            'postal_code',
            'country',
            'phone_number',
        )
        read_only_fields = ['id', 'username']  # On empêche la modification côté frontend
    
    def validate_siret_number(self, value):
        if value == "":
            return None
        return value
        
class CustomUserCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    email = serializers.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'role', 'company_name', 'siret_number')
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def validate_siret_number(self, value):
        if value == "":
            return None
        if value and len(value) != 14:
            raise serializers.ValidationError("Le numéro SIRET doit avoir 14 caractères.")
        return value
    
    def create(self, validated_data):
        validated_data['siret_number'] = validated_data.get('siret_number') or None
        user = CustomUser.objects.create_user(**validated_data)
        user.is_active = False
        user.save()

        # Génération des éléments pour l'activation
        uid = urlsafe_base64_encode(force_bytes(user.pk)) # Encodage de l'ID utilisateur"
        token = default_token_generator.make_token(user) # Génération du token d'activation
        activation_link = f"http://localhost:4200/activate/{uid}/{token}"  # ou domaine en prod

        if user.email and '@' in user.email:
            try:
                send_mail(
                    subject="Bienvenue sur Terres Fertiles - Activez votre compte",
                    message="Merci de cliquer sur le lien pour activer votre compte.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    fail_silently=False,
                    recipient_list=[user.email],
                    html_message=f"""
                        <h3>Bienvenue {user.username} !</h3>
                        <p>Merci pour votre inscription sur Terres Fertiles.</p>
                        <p><a href="{activation_link}">Cliquez ici pour activer votre compte</a></p>
                        <p>Si le lien ne fonctionne pas, copiez-collez l'URL suivante dans votre navigateur :</p>
                        <p>{activation_link}</p>
                        <p>Si vous n'avez pas créé ce compte, ignorez ce message.</p
                        <p>À bientôt sur Terres Fertiles !</p>
                    """
                )
                print(f"✅ Email de confirmation envoyé à {user.email}")
            except Exception as e:
                print(f"❌ Erreur lors de l'envoi du mail : {e}")
        else:
            print("⚠️ Email invalide, aucun mail envoyé.")

        return user



class ChantierSerializer(serializers.ModelSerializer):
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username')

   
        
    class Meta:
        model = Chantier
        fields = '__all__'
        read_only_fields = ['utilisateur']  # On empêche la modification côté frontend

class DocumentGisementSerializer(serializers.ModelSerializer):
    fichier = serializers.FileField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = DocumentGisement
        fields = '__all__'
        read_only_fields = ['utilisateur']  # On empêche la modification côté frontend


class GisementSerializer(serializers.ModelSerializer):
    chantier = serializers.PrimaryKeyRelatedField(queryset=Chantier.objects.all())
    chantier_nom = serializers.CharField(source='chantier.nom', read_only=True)
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username', read_only=True)
    documents = DocumentGisementSerializer(many=True, read_only=True)

    class Meta:
        model = Gisement
        fields = [
            'id', 'chantier', 'chantier_nom', 'documents', 'nom', 'date_creation',
            'commune', 'periode_terrassement', 'volume_terrasse', 'materiau',
            'localisation', 'latitude', 'longitude', 'type_de_sol','utilisateur'
        ]
        read_only_fields = ['nom', 'date_creation'] # On empêche la modification côté frontend



class MelangeIngredientSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='gisement.nom', read_only=True)
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username')
    type = serializers.SerializerMethodField()

    class Meta:
        model = MelangeIngredient
        fields = ("id", "gisement", "pourcentage", "nom", "type", "utilisateur")
        read_only_fields = ['utilisateur']  # On empêche la modification côté frontend

    def get_type(self, obj):
        return "Gisement"



from rest_framework import serializers
from .models import MelangeAmendement

class MelangeAmendementSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='amendementOrganique.nom', read_only=True)
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username')
    type = serializers.SerializerMethodField()

    class Meta:
        model = MelangeAmendement
        fields = ("id", "melange", "amendementOrganique", "pourcentage", "nom", "type", "utilisateur")
        read_only_fields = ['utilisateur']  # On empêche la modification côté frontend
        validators = []  # Désactive la validation unique-together automatique de DRF

    def get_type(self, obj):
        return "Amendement"

    def validate(self, data):
        """
        On évite ici l'erreur de contrainte unique en supprimant la vérif automatique.
        La logique est gérée manuellement dans create().
        """
        melange = data.get('melange')
        amendement = data.get('amendementOrganique')

        # Si c'est un POST (création) et le couple existe déjà, on ne lève pas d'erreur ici.
        if self.instance is None:
            exists = MelangeAmendement.objects.filter(
                melange=melange,
                amendementOrganique=amendement
            ).exists()
            if exists:
                # Ne rien faire ici pour laisser create() gérer update_or_create
                pass

        return data

    def create(self, validated_data):
        melange = validated_data.get('melange')
        amendement = validated_data.get('amendementOrganique')
        pourcentage = validated_data.get('pourcentage')

        # 👉 Ici on gère proprement create/update
        instance, created = MelangeAmendement.objects.update_or_create(
            melange=melange,
            amendementOrganique=amendement,
            defaults={'pourcentage': pourcentage}
        )
        return instance






    
class MelangeSerializer(serializers.ModelSerializer):

    etat_display = serializers.CharField(source='get_etat_display', read_only=True)
    ingredients = MelangeIngredientSerializer(many=True)
    amendements = MelangeAmendementSerializer(many=True, required=False)
    plateforme_nom = serializers.CharField(source='plateforme.nom', read_only=True)
    date_semis = serializers.DateField(format='%Y-%m-%d')
    date_creation = serializers.DateField(format='%Y-%m-%d', read_only=True)
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username')
    nom_complet = serializers.SerializerMethodField()


    class Meta:
        model = Melange
        fields = '__all__'
        read_only_fields = ['plateforme_nom', 'date_creation', 'utilisateur','amendements', 'nom_complet']  # On empêche la modification côté frontend

    def get_nom_complet(self, obj):
        user = getattr(obj, 'utilisateur', None)
        if user:
            first_name = getattr(user, 'first_name', '') or ''
            last_name = getattr(user, 'last_name', '') or ''
            full_name = f"{first_name} {last_name}".strip()
            return full_name if full_name else getattr(user, 'username', '')
        return ''


    def create(self, validated_data):
        ingredients_data = validated_data.pop("ingredients", [])
       
        melange = Melange.objects.create(**validated_data)

        for item in ingredients_data:
            MelangeIngredient.objects.create(melange=melange, **item)
       
    
        return melange

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop("ingredients", None)
        amendements_data = validated_data.pop("amendements", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ingredients_data is not None:
            instance.ingredients.all().delete()
            for item in ingredients_data:
                MelangeIngredient.objects.create(melange=instance, **item)

      

        return instance

class AmendementOrganiqueSerializer(serializers.ModelSerializer):
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username')
    class Meta:
        model = AmendementOrganique
        fields = '__all__'
        read_only_fields = ['utilisateur']  # On empêche la modification côté frontend





class DocumentTechniqueSerializer(serializers.ModelSerializer):
    produit = serializers.PrimaryKeyRelatedField(queryset=ProduitVente.objects.all())
    uploaded_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = DocumentTechnique
        fields = '__all__'


class AnalyseLaboratoireSerializer(serializers.ModelSerializer):
    produit = serializers.PrimaryKeyRelatedField(queryset=ProduitVente.objects.all())
    uploaded_by = serializers.ReadOnlyField(source='uploaded_by.username')
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username')

    class Meta:
        model = AnalyseLaboratoire
        fields = '__all__'
        read_only_fields = ['utilisateur']
    def create(self, validated_data):
        validated_data.pop('uploaded_by', None)
        return super().create(validated_data)
    
class PlateformeSerializer(serializers.ModelSerializer):
    responsable = serializers.ReadOnlyField(source='responsable.username')
    
    class Meta:
        model = Plateforme
        fields = '__all__'
        read_only_fields = ['responsable']  # On empêche la modification côté frontend

    def create(self, validated_data):
        validated_data['responsable'] = self.context['request'].user
        validated_data['date_creation'] = datetime.now().date() 
        return super().create(validated_data)


class ProduitVenteDetailSerializer(serializers.ModelSerializer):
    # Sérialisation des relations en utilisant tes serializers déjà faits
    utilisateur = serializers.ReadOnlyField(source='utilisateur.username')
    melange = MelangeSerializer(read_only=True)
    documents = DocumentTechniqueSerializer(many=True, read_only=True)
    analyses = AnalyseLaboratoireSerializer(many=True, read_only=True)
    
    
    chantier_info = serializers.SerializerMethodField()
    plateforme = serializers.SerializerMethodField()
    temps_sur_plateforme = serializers.SerializerMethodField()
    delai_avant_disponibilite = serializers.SerializerMethodField()
    volume_restant = serializers.ReadOnlyField(read_only=True)  # Utilise le champ calculé dans le modèle

    class Meta:
        model = ProduitVente
        fields = [
            'id', 'reference_produit', 'fournisseur', 'volume_initial', 'volume_disponible', 'volume_restant',
            'date_disponibilite', 'volume_vendu', 'acheteur', 'date_achat', 'periode_destockage', 'localisation_projet',
            'commentaires_analyses',
            'melange', 'documents', 'analyses', 'utilisateur',
            'chantier_info', 'plateforme', 'temps_sur_plateforme', 'delai_avant_disponibilite'
        ]
        read_only_fields = ['melange', 'documents', 'analyses', 'utilisateur']  # On empêche la modification côté frontend
    def get_chantier_info(self, obj):
        # Récupérer chantier depuis premier gisement du melange s’il existe
        melange = obj.melange
        if melange and melange.ingredients.exists():
            premier_gisement = melange.ingredients.first().gisement
            chantier = premier_gisement.chantier
            return {
                'id': chantier.id,
                'nom': chantier.nom,
                'localisation': chantier.localisation
            }
        return None

    def get_plateforme(self, obj):
        melange = obj.melange
        if melange and melange.plateforme:
            return {
                'id': melange.plateforme.id,
                'nom': melange.plateforme.nom,
                'localisation': melange.plateforme.localisation
            }
        return None

    def get_temps_sur_plateforme(self, obj):
        if obj.melange and obj.date_disponibilite and obj.melange.date_creation:
            return (obj.date_disponibilite - obj.melange.date_creation).days
        return None

    def get_delai_avant_disponibilite(self, obj):
        if obj.date_disponibilite:
            return (obj.date_disponibilite - date.today()).days
        return None

class DocumentProduitVenteSerializer(serializers.ModelSerializer):
    responsable = serializers.ReadOnlyField(source='produit.utilisateur.username')

    class Meta:
        model = DocumentProduitVente
        fields = '__all__'
        read_only_fields = ['responsable']  # On empêche la modification côté frontend

# Ce serializer permet de gérer la conversion du modèle SaisieVente en JSON pour l'API.
# Le champ 'responsable' est en lecture seule et affiche le nom d'utilisateur du responsable.
class SaisieVenteSerializer(serializers.ModelSerializer):
    responsable = serializers.ReadOnlyField(source='responsable.username')
    produit = ProduitVenteDetailSerializer(read_only=True)

    class Meta:
        model = SaisieVente
        fields = '__all__'
        read_only_fields = ['responsable']



class ChantierRecepteurSerializer(serializers.ModelSerializer):
    responsable = serializers.ReadOnlyField(source='responsable.username')

    class Meta:
        model = ChantierRecepteur
        fields = '__all__'
        read_only_fields = ['responsable']  # On empêche la modification côté frontend




class PlanningSerializer(serializers.ModelSerializer):
    
    melange_nom = serializers.CharField(source='melange.nom', read_only=True)
    responsable = serializers.ReadOnlyField(source='responsable.username')
    
    class Meta:
        model = Planning
        fields = ['id', 'titre', 'date_debut', 'duree_jours', 'statut', 'melange', 'melange_nom', 'responsable']
        read_only_fields = ['melange_nom', 'responsable']
     # faire en sorte que l'utilisateur connecté soit automatiquement le responsable
    def create(self, validated_data):
        validated_data['responsable'] = self.context['request'].user
        return super().create(validated_data)