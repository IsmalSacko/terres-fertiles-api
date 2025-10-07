#!/usr/bin/env python
"""Test direct avec le token généré"""
import requests
import json

# Lire le token depuis le fichier
try:
    with open('auth_token.txt', 'r') as f:
        TOKEN = f.read().strip()
except FileNotFoundError:
    print("❌ Fichier auth_token.txt non trouvé. Exécutez d'abord generate_token.py")
    exit(1)

API_URL = "http://localhost:8000/api/suivi-stock-plateforme/"
headers = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}

def test_error_400_resolution():
    """Test de résolution de l'erreur 400"""
    print("🔍 Test de résolution de l'erreur 400")
    print("=" * 50)
    
    # Test 1: Créer avec un andain existant (doit donner 400)
    print("\n📝 Test 1: Tentative avec andain existant (numéro 1)")
    
    data_duplicate = {
        "andain_numero": 1,
        "plateforme": 7,
        "melange": 2,
        "volume_initial_m3": 100.0,
        "volume_restant_m3": 100.0,
        "statut": "en_cours",
        "date_mise_en_andains": "2025-10-07"
    }
    
    try:
        response = requests.post(API_URL, json=data_duplicate, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Erreur 400 correctement retournée")
            error_data = response.json()
            print("📋 Détails de l'erreur pour le frontend:")
            print(json.dumps(error_data, indent=2))
            
            # Vérifier le type d'erreur
            if 'non_field_errors' in error_data:
                print("✅ Erreur d'unicité détectée dans non_field_errors")
                return True
            elif 'andain_numero' in error_data:
                print("✅ Erreur d'andain_numero détectée")
                return True
        elif response.status_code == 201:
            # Si la création réussit, supprimer l'objet créé
            created = response.json()
            delete_resp = requests.delete(f"{API_URL}{created['id']}/", headers=headers)
            print(f"⚠️ Création réussie inattendue, objet supprimé: {delete_resp.status_code}")
        else:
            print(f"❌ Status code inattendu: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Serveur Django non accessible. Vérifiez qu'il est en cours d'exécution.")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    return False

def test_successful_creation():
    """Test de création réussie avec andain unique"""
    print("\n📝 Test 2: Création avec andain unique (numéro 9999)")
    
    data_unique = {
        "andain_numero": 9999,
        "plateforme": 7,
        "melange": 2,
        "volume_initial_m3": 100.0,
        "volume_restant_m3": 100.0,
        "statut": "en_cours",
        "date_mise_en_andains": "2025-10-07"
    }
    
    try:
        response = requests.post(API_URL, json=data_unique, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Création réussie avec andain unique")
            created = response.json()
            
            # Nettoyer en supprimant l'objet créé
            delete_resp = requests.delete(f"{API_URL}{created['id']}/", headers=headers)
            print(f"🧹 Nettoyage effectué: {delete_resp.status_code}")
            return True
        else:
            print(f"❌ Création échouée: {response.status_code}")
            if response.status_code == 400:
                error_data = response.json()
                print("Erreurs:")
                print(json.dumps(error_data, indent=2))
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    return False

if __name__ == "__main__":
    print(f"🔑 Utilisation du token: {TOKEN[:20]}...")
    
    test1_result = test_error_400_resolution()
    test2_result = test_successful_creation()
    
    print("\n" + "=" * 50)
    print("📊 RÉSULTATS:")
    print(f"Test erreur 400: {'✅ PASS' if test1_result else '❌ FAIL'}")
    print(f"Test création OK: {'✅ PASS' if test2_result else '❌ FAIL'}")
    
    if test1_result:
        print("\n🎉 La résolution de l'erreur 400 fonctionne!")
        print("✅ Le frontend peut maintenant récupérer les détails de l'erreur")
        print("✅ Les messages d'erreur spécifiques seront affichés à l'utilisateur")
    else:
        print("\n⚠️ La résolution nécessite encore du travail")