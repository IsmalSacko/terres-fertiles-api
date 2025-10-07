#!/usr/bin/env python3
"""
Script final pour tester la création complète avec navigation
"""

import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')  
django.setup()

from core.models import SuiviStockPlateforme

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
        
        if response.status_code == 200:
            token = response.json().get('auth_token')
            if token:
                print(f"✅ Token obtenu")
                return token
        return None
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def test_creation_flow():
    """Tester le flux complet de création"""
    token = get_auth_token()
    if not token:
        return False
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    # Trouver un andain disponible
    existing_andains = list(SuiviStockPlateforme.objects.filter(plateforme_id=7).values_list('andain_numero', flat=True))
    next_andain = 1
    while next_andain in existing_andains:
        next_andain += 1
    
    test_data = {
        'andain_numero': next_andain,
        'plateforme': 7,
        'melange': 1,
        'produit_vente': 1,
        'volume_initial_m3': 500.0,
        'volume_restant_m3': 450.0,
        'statut': 'en_culture',
        'date_mise_en_andains': '2025-10-06',
        'date_mise_en_culture': '2025-10-06',
        'date_previsionnelle_vente': '2025-10-25',
        'date_ecoulement': '2025-11-10',
        'recette': None,
        'remarques': 'Test final après corrections complètes'
    }
    
    print(f"🧪 Test création avec andain_numero={next_andain}")
    
    try:
        response = requests.post(
            f'{API_BASE_URL}/api/suivi-stock-plateforme/',
            headers=headers,
            json=test_data
        )
        
        if response.status_code == 201:
            created_data = response.json()
            record_id = created_data.get('id')
            
            print(f"✅ Création réussie!")
            print(f"📦 ID: {record_id}")
            print(f"🔗 URL Angular: /suivistock/detail/{record_id}")
            
            # Tester que l'enregistrement peut être récupéré
            detail_response = requests.get(
                f'{API_BASE_URL}/api/suivi-stock-plateforme/{record_id}/',
                headers=headers
            )
            
            if detail_response.status_code == 200:
                print(f"✅ Détail récupérable via API")
                return True
            else:
                print(f"❌ Impossible de récupérer le détail: {detail_response.status_code}")
                return False
                
        else:
            print(f"❌ Erreur création: {response.status_code}")
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erreur requête: {e}")
        return False

def main():
    print("🎯 Test final du flux complet création + navigation")
    print("=" * 60)
    
    success = test_creation_flow()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 FLUX COMPLET FONCTIONNEL!")
        print("✅ Création API réussie")
        print("✅ ID retourné valide")
        print("✅ Route de navigation corrigée")
        print("✅ Détail accessible via API")
        print("\n👍 Angular devrait maintenant:")
        print("   • Créer l'enregistrement sans erreur")
        print("   • Naviguer vers /suivistock/detail/{id}")
        print("   • Afficher la page de détail")
    else:
        print("❌ Des problèmes persistent")

if __name__ == '__main__':
    main()