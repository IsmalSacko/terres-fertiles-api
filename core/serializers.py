import requests
from datetime import datetime
from rest_framework import serializers
from .models import (
    CustomUser, Chantier, DocumentGisement, Gisement, Compost, MelangeIngredient, Plateforme,
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
        fields = '__all__'

class GisementSerializer(serializers.ModelSerializer):
    chantier = serializers.PrimaryKeyRelatedField(queryset=Chantier.objects.all())
    documents = DocumentGisementSerializer(many=True, read_only=True)

    class Meta:
        model = Gisement
        fields = '__all__'
        read_only_fields = ['nom', 'date_creation']  # ← lecture seule


#
class MelangeIngredientSerializer(serializers.ModelSerializer):
    gisement = serializers.PrimaryKeyRelatedField(queryset=Gisement.objects.all()) 

    class Meta:
        model = MelangeIngredient
        fields = ("gisement", "pourcentage")


class CompostSerializer(serializers.ModelSerializer):
    chantier = serializers.PrimaryKeyRelatedField(queryset=Chantier.objects.all())

    class Meta:
        model = Compost
        fields = '__all__'


class MelangeSerializer(serializers.ModelSerializer):
    etat_display = serializers.CharField(source='get_etat_display', read_only=True)
    ingredients = MelangeIngredientSerializer(many=True)
    date_semis = serializers.DateField(format='%Y-%m-%d')
    date_creation = serializers.DateField(format='%Y-%m-%d', read_only=True)

    class Meta:
        model = Melange
        fields = '__all__'

    def create(self, validated_data):
        ingredients_data = validated_data.pop("ingredients")
        melange = Melange.objects.create(**validated_data)
        for item in ingredients_data:
            MelangeIngredient.objects.create(melange=melange, **item)
        return melange

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop("ingredients", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ingredients_data is not None:
            instance.ingredients.all().delete()
            for item in ingredients_data:
                MelangeIngredient.objects.create(melange=instance, **item)

        return instance
    


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
    
class PlateformeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plateforme
        fields = '__all__'
        read_only_fields = ['responsable']  # On empêche la modification côté frontend

    def create(self, validated_data):
        validated_data['responsable'] = self.context['request'].user
        validated_data['date_creation'] = datetime.now().date() 
        return super().create(validated_data)

        