#!/usr/bin/env python3
"""
Script de débogage avec authentification pour analyser l'erreur 400
"""

import requests
import json
from datetime import date

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

def get_auth_token():
    """Obtenir un token d'authentification"""
    
    # Créer un utilisateur de test ou utiliser des credentials existants
    login_data = {
        "username": "testuser",  # Remplacer par un utilisateur existant
        "password": "testpass123"  # Remplacer par le mot de passe
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            return response.json().get("access")
        else:
            print(f"Erreur d'authentification: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Erreur lors de la connexion: {e}")
        return None

def test_with_auth():
    """Tester avec authentification"""
    
    # Essayer d'obtenir un token
    token = get_auth_token()
    
    if not token:
        print("⚠️ Impossible d'obtenir un token d'authentification")
        print("Créons un utilisateur de test d'abord...")
        create_test_user()
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("=== TEST AVEC AUTHENTIFICATION ===\n")
    
    # Test des endpoints avec auth
    try:
        # 1. Plateformes
        response = requests.get(f"{API_URL}/plateformes/", headers=headers)
        print(f"Plateformes: {response.status_code}")
        if response.status_code == 200:
            plateformes = response.json()
            print(f"   {len(plateformes)} plateformes trouvées")
        
        # 2. Mélanges
        response = requests.get(f"{API_URL}/melanges/", headers=headers)
        print(f"Mélanges: {response.status_code}")
        if response.status_code == 200:
            melanges = response.json()
            print(f"   {len(melanges)} mélanges trouvés")
        
        # 3. Suivi stock
        response = requests.get(f"{API_URL}/suivi-stock-plateforme/", headers=headers)  
        print(f"Suivi stock: {response.status_code}")
        if response.status_code == 200:
            suivis = response.json()
            print(f"   {len(suivis)} suivis trouvés")
            
        # 4. Test création
        test_data = {
            "andain_numero": "DEBUG001",
            "plateforme": 1,
            "melange": 1,
            "volume_initial_m3": 50.0,
            "volume_restant_m3": 50.0,
            "statut": "en_stock",
            "date_mise_en_andains": str(date.today()),
            "remarques": "Test debug"
        }
        
        print(f"\nTest création avec données: {json.dumps(test_data, indent=2)}")
        response = requests.post(f"{API_URL}/suivi-stock-plateforme/", json=test_data, headers=headers)
        print(f"Création: {response.status_code}")
        
        if response.status_code >= 400:
            try:
                error = response.json()
                print(f"Erreur détaillée: {json.dumps(error, indent=2)}")
            except:
                print(f"Erreur: {response.text}")
        else:
            print("✅ Création réussie!")
            
    except Exception as e:
        print(f"Erreur: {e}")

def create_test_user():
    """Créer un utilisateur de test"""
    
    print("=== CRÉATION D'UN UTILISATEUR DE TEST ===\n")
    
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "role": "producteur",
        "company_name": "Test Company"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/register/", json=user_data)
        print(f"Création utilisateur: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("✅ Utilisateur créé avec succès")
            # Note: L'utilisateur peut nécessiter une activation
        else:
            error = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            print(f"Erreur création utilisateur: {error}")
            
    except Exception as e:
        print(f"Exception: {e}")

def check_django_logs():
    """Vérifier les logs Django pour plus d'infos"""
    
    print("=== CONSEILS DE DÉBOGAGE ===\n")
    print("1. Vérifiez les logs Django dans le terminal du serveur")
    print("2. Vérifiez que l'utilisateur frontend est bien connecté")
    print("3. Vérifiez la validité du token JWT dans le localStorage")
    print("4. Vérifiez les données envoyées par Angular dans l'onglet Network")
    print("\n📋 Commandes utiles:")
    print("   - Dans le frontend Angular, ouvrir les DevTools > Network")
    print("   - Regarder la requête POST vers /api/suivi-stock-plateforme/")
    print("   - Vérifier les headers Authorization")
    print("   - Examiner le body de la requête")

if __name__ == "__main__":
    print("DIAGNOSTIC AVANCÉ - ERREUR 400 AVEC AUTHENTIFICATION")
    print("=" * 55)
    print()
    
    test_with_auth()
    check_django_logs()
    
    print("\n" + "=" * 55)
    print("FIN DU DIAGNOSTIC")