#!/usr/bin/env python
"""
Script de test pour diagnostiquer l'erreur 400 lors de la création de suivi stock
"""
import os
import django
import json
from datetime import date

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import SuiviStockPlateforme, Plateforme, Melange
from core.serializers import SuiviStockPlateformeCreateSerializer

User = get_user_model()

def test_creation_suivi_stock():
    """Test de création d'un suivi de stock"""
    print("=== Test de création de suivi stock ===")
    
    # Récupérer des données existantes
    user = User.objects.first()
    plateforme = Plateforme.objects.first()
    melange = Melange.objects.first()
    
    if not user:
        print("❌ Aucun utilisateur trouvé")
        return
    if not plateforme:
        print("❌ Aucune plateforme trouvée")
        return
    
    print(f"✅ Utilisateur: {user.username}")
    print(f"✅ Plateforme: {plateforme.nom}")
    print(f"✅ Mélange: {melange.nom if melange else 'Aucun'}")
    
    # Données de test (similaires à ce qui serait envoyé par Angular)
    test_data = {
        'andain_numero': 1,
        'plateforme': plateforme.id,
        'melange': melange.id if melange else None,
        'volume_initial_m3': 100.0,
        'volume_restant_m3': 100.0,
        'statut': 'en_cours',
        'date_mise_en_andains': date.today().isoformat(),
        'date_mise_en_culture': None,
        'date_previsionnelle_vente': None,
        'date_ecoulement': None,
        'recette': None,
        'remarques': None
    }
    
    print("\n=== Données de test ===")
    print(json.dumps(test_data, indent=2, default=str))
    
    # Simuler le contexte de la requête
    class MockRequest:
        def __init__(self, user):
            self.user = user
    
    mock_request = MockRequest(user)
    
    # Tester la validation du serializer
    serializer = SuiviStockPlateformeCreateSerializer(
        data=test_data, 
        context={'request': mock_request}
    )
    
    print("\n=== Test de validation ===")
    if serializer.is_valid():
        print("✅ Validation réussie")
        try:
            instance = serializer.save()
            print(f"✅ Création réussie: {instance}")
            # Supprimer l'instance créée pour éviter les conflits
            instance.delete()
            print("✅ Instance supprimée après test")
        except Exception as e:
            print(f"❌ Erreur lors de la création: {e}")
    else:
        print("❌ Validation échouée")
        print("Erreurs:", serializer.errors)
    
    # Tester différents cas d'erreur
    print("\n=== Test de cas d'erreur ===")
    
    # Test avec andain déjà existant
    if SuiviStockPlateforme.objects.filter(plateforme=plateforme, andain_numero=1).exists():
        print("⚠️  Un andain numéro 1 existe déjà pour cette plateforme")
        # Essayer avec un autre numéro
        test_data['andain_numero'] = 9999
        serializer = SuiviStockPlateformeCreateSerializer(
            data=test_data, 
            context={'request': mock_request}
        )
        if serializer.is_valid():
            print("✅ Validation avec nouveau numéro d'andain réussie")
        else:
            print("❌ Encore une erreur:", serializer.errors)

if __name__ == '__main__':
    test_creation_suivi_stock()