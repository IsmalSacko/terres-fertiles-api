from rest_framework import serializers
from .models import (
    CustomUser, Chantier, DocumentGisement, Gisement, Compost,
    Melange, ProduitVente, DocumentTechnique, AnalyseLaboratoire
)


class CustomUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'role', 'company_name', 'siret_number')

    def validate_siret_number(self, value):
        if value and len(value) != 14:
            raise serializers.ValidationError("Le numéro SIRET doit avoir 14 caractères.")
        return value

class CustomUserCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'role', 'company_name', 'siret_number')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

class ChantierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chantier
        fields = '__all__'

class DocumentGisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentGisement
        fields = ['id', 'gisement', 'nom_fichier', 'fichier', 'date_ajout']

class GisementSerializer(serializers.ModelSerializer):
    chantier = serializers.PrimaryKeyRelatedField(queryset=Chantier.objects.all())
    documents = DocumentGisementSerializer(many=True, read_only=True)

    class Meta:
        model = Gisement
        fields = '__all__'


class CompostSerializer(serializers.ModelSerializer):
    chantier = serializers.PrimaryKeyRelatedField(queryset=Chantier.objects.all())

    class Meta:
        model = Compost
        fields = '__all__'


class MelangeSerializer(serializers.ModelSerializer):
    chantier = serializers.PrimaryKeyRelatedField(queryset=Chantier.objects.all())

    class Meta:
        model = Melange
        fields = '__all__'


class ProduitVenteSerializer(serializers.ModelSerializer):
    chantier = serializers.PrimaryKeyRelatedField(queryset=Chantier.objects.all())
    melange = serializers.PrimaryKeyRelatedField(queryset=Melange.objects.all(), allow_null=True)

    class Meta:
        model = ProduitVente
        fields = '__all__'


class DocumentTechniqueSerializer(serializers.ModelSerializer):
    produit = serializers.PrimaryKeyRelatedField(queryset=ProduitVente.objects.all())
    uploaded_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = DocumentTechnique
        fields = '__all__'







class AnalyseLaboratoireSerializer(serializers.ModelSerializer):
    produit = serializers.PrimaryKeyRelatedField(queryset=ProduitVente.objects.all())
    uploaded_by = serializers.ReadOnlyField(source='uploaded_by.username')

    class Meta:
        model = AnalyseLaboratoire
        fields = '__all__'
    def create(self, validated_data):
        validated_data.pop('uploaded_by', None)
        return super().create(validated_data)
