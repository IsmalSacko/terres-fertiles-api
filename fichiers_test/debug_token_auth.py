#!/usr/bin/env python3
"""
Script de test avec l'authentification Token Django (comme utilisé par Angular)
"""

import requests
import json
from datetime import date

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

def test_token_auth():
    """Tester avec l'authentification Token Django"""
    
    print("=== TEST AUTHENTIFICATION TOKEN DJANGO ===\n")
    
    # 1. Essayer de se connecter
    login_data = {
        "username": "testadmin",
        "password": "testpass123"
    }
    
    print("1. Tentative de connexion...")
    try:
        response = requests.post(f"{API_URL}/auth/token/login/", json=login_data)
        print(f"   Status connexion: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"   Token reçu: {token_data}")
            token = token_data.get('auth_token')
            
            if token:
                test_api_with_token(token)
            else:
                print("   ❌ Pas de token dans la réponse")
        else:
            print(f"   ❌ Erreur connexion: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")

def test_api_with_token(token):
    """Tester l'API avec le token"""
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n2. Test avec token: {token[:20]}...")
    
    # Test GET plateformes
    try:
        response = requests.get(f"{API_URL}/plateformes/", headers=headers)
        print(f"   Plateformes: {response.status_code}")
        
        if response.status_code == 200:
            plateformes = response.json()
            print(f"   ✅ {len(plateformes)} plateformes trouvées")
            
            if plateformes:
                plateforme_id = plateformes[0]['id']
                print(f"   Première plateforme: ID={plateforme_id}")
                
                # Test GET mélanges
                response = requests.get(f"{API_URL}/melanges/", headers=headers)
                print(f"   Mélanges: {response.status_code}")
                
                if response.status_code == 200:
                    melanges = response.json()
                    print(f"   ✅ {len(melanges)} mélanges trouvés")
                    
                    if melanges:
                        melange_id = melanges[0]['id']
                        print(f"   Premier mélange: ID={melange_id}")
                        
                        # Test création suivi stock
                        test_create_suivi_stock(headers, plateforme_id, melange_id)
                    
    except Exception as e:
        print(f"   ❌ Exception: {e}")

def test_create_suivi_stock(headers, plateforme_id, melange_id):
    """Tester la création de suivi stock"""
    
    print(f"\n3. Test création suivi stock...")
    
    # Test avec différents andains pour éviter les conflits
    for i in range(100, 103):  # Utiliser des numéros plus élevés
        andain = f"TEST{i:03d}"
        
        test_data = {
            "andain_numero": i,  # Nombre entier, pas string
            "plateforme": plateforme_id,
            "melange": melange_id,
            "produit_vente": None,
            "volume_initial_m3": 50.0,
            "volume_restant_m3": 50.0,
            "statut": "en_cours",  # Statut valide
            "date_mise_en_andains": str(date.today()),
            "date_mise_en_culture": None,
            "date_previsionnelle_vente": None,
            "date_ecoulement": None,
            "recette": None,
            "remarques": f"Test debug {i}"
        }
        
        print(f"   Test {i}: Andain {andain}")
        print(f"   Données: {json.dumps(test_data, indent=4)}")
        
        try:
            response = requests.post(f"{API_URL}/suivi-stock-plateforme/", json=test_data, headers=headers)
            print(f"   Status: {response.status_code}")
            
            if response.status_code >= 400:
                print("   ❌ ERREUR DÉTECTÉE:")
                try:
                    error_data = response.json()
                    print(f"   Erreur JSON: {json.dumps(error_data, indent=4)}")
                    
                    # Analyser les erreurs spécifiques
                    if isinstance(error_data, dict):
                        for field, messages in error_data.items():
                            print(f"   🔍 Champ '{field}': {messages}")
                            
                except:
                    print(f"   Erreur texte: {response.text}")
                
                # Arrêter après la première erreur pour l'analyser
                break
            else:
                print("   ✅ Succès!")
                try:
                    result = response.json()
                    print(f"   Créé: ID={result.get('id')}, Référence={result.get('reference_suivi')}")
                except:
                    pass
                break
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")

def check_existing_data():
    """Vérifier les données existantes qui pourraient causer des conflits"""
    
    print("\n=== VÉRIFICATION DES DONNÉES EXISTANTES ===\n")
    
    # Sans authentification, juste pour voir les erreurs
    try:
        response = requests.get(f"{API_URL}/suivi-stock-plateforme/")
        print(f"Suivi stock (sans auth): {response.status_code}")
        if response.status_code == 403:
            print("   Normal: authentification requise")
    except Exception as e:
        print(f"   Exception: {e}")

if __name__ == "__main__":
    print("DIAGNOSTIC COMPLET - ERREUR 400 SUIVI STOCK")
    print("=" * 50)
    
    check_existing_data()
    test_token_auth()
    
    print("\n" + "=" * 50)
    print("CONSEILS DE DÉBOGAGE:")
    print("1. Vérifiez que l'utilisateur est connecté dans Angular")
    print("2. Vérifiez le token dans localStorage (F12 > Application > Storage)")
    print("3. Regardez les logs Django dans le terminal serveur")
    print("4. Vérifiez l'onglet Network dans DevTools pour voir la requête exacte")
    print("=" * 50)