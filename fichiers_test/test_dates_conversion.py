#!/usr/bin/env python3
"""
Script de test pour valider la conversion des dates et la création de suivi stock
"""

import os
import sys
import django
import requests
import json
from datetime import datetime, date

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

# Configuration de l'API
API_BASE_URL = 'http://localhost:8000'
USERNAME = 'testadmin'
PASSWORD = 'testpass123'

def get_auth_token():
    """Obtenir le token d'authentification"""
    try:
        response = requests.post(f'{API_BASE_URL}/api/auth/token/login/', {
            'username': USERNAME,
            'password': PASSWORD
        })
        
        print(f"Status: {response.status_code}")
        print(f"Réponse: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"Structure de la réponse: {response_data}")
            
            # Essayer différents champs possibles
            token = response_data.get('auth_token') or response_data.get('token') or response_data.get('access_token')
            if token:
                print(f"✅ Token obtenu avec succès")
                return token
            else:
                print(f"❌ Aucun token trouvé dans la réponse")
                return None
        else:
            print(f"❌ Erreur d'authentification: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def test_suivi_stock_creation():
    """Tester la création d'un suivi stock avec les dates au bon format"""
    token = get_auth_token()
    if not token:
        return False
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    # Données de test avec des dates au format string ISO
    test_data = {
        'andain_numero': 4,  # Integer
        'plateforme': 7,     # Integer 
        'melange': 2,        # Integer
        'produit_vente': 1,  # Integer
        'volume_initial_m3': 150.5,  # Float
        'volume_restant_m3': 140.0,  # Float
        'statut': 'en_cours',
        # Dates au format ISO string (ce que l'Angular devrait envoyer maintenant)
        'date_mise_en_andains': '2025-10-01',
        'date_mise_en_culture': '2025-10-07', 
        'date_previsionnelle_vente': '2025-10-15',
        'date_ecoulement': '2025-10-20',
        'recette': None,
        'remarques': 'Test avec dates corrigées'
    }
    
    print("📤 Données envoyées:")
    print(json.dumps(test_data, indent=2, default=str))
    
    try:
        response = requests.post(
            f'{API_BASE_URL}/api/suivi-stock-plateforme/',
            headers=headers,
            json=test_data
        )
        
        print(f"\n📡 Status Code: {response.status_code}")
        print(f"📡 Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            created_data = response.json()
            print("✅ Suivi stock créé avec succès!")
            print("📦 Données créées:")
            print(json.dumps(created_data, indent=2, default=str))
            return True
        else:
            print(f"❌ Erreur lors de la création: {response.status_code}")
            try:
                error_data = response.json()
                print("📦 Détails de l'erreur:")
                print(json.dumps(error_data, indent=2))
            except:
                print("📦 Réponse brute:")
                print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erreur de requête: {e}")
        return False

def main():
    print("🧪 Test de création de suivi stock avec dates corrigées")
    print("=" * 60)
    
    success = test_suivi_stock_creation()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Tous les tests sont passés!")
        print("🎉 Les dates sont maintenant correctement formatées!")
    else:
        print("❌ Des erreurs ont été détectées")
        print("🔧 Vérifiez la configuration et les données")

if __name__ == '__main__':
    main()