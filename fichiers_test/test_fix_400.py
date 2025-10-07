#!/usr/bin/env python
"""Test final pour vérifier la résolution du problème d'erreur 400"""
import requests
import json

# URL de l'API
API_URL = "http://localhost:8000/api/suivi-stock-plateforme/"
TOKEN = "votre_token_ici"  # Remplacer par un token valide

# Headers avec authentification
headers = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}

def test_creation_avec_andain_existant():
    """Test de création avec un andain qui existe déjà (doit échouer avec erreur 400)"""
    print("=== Test 1: Création avec andain existant ===")
    
    data = {
        "andain_numero": 1,  # Numéro probablement déjà utilisé
        "plateforme": 7,
        "melange": 2,
        "volume_initial_m3": 100.0,
        "volume_restant_m3": 100.0,
        "statut": "en_cours",
        "date_mise_en_andains": "2025-10-07"
    }
    
    try:
        response = requests.post(API_URL, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Erreur 400 attendue reçue")
            error_data = response.json()
            print("Détails de l'erreur:")
            print(json.dumps(error_data, indent=2))
            
            # Vérifier si c'est bien une erreur d'unicité
            if 'non_field_errors' in error_data:
                for error in error_data['non_field_errors']:
                    if 'unique set' in error:
                        print("✅ Erreur d'unicité correctement détectée")
                        return True
            
            if 'andain_numero' in error_data:
                print("✅ Erreur sur andain_numero correctement détectée")
                return True
                
        else:
            print(f"❌ Status code inattendu: {response.status_code}")
            if response.status_code == 201:
                print("⚠️ Création réussie - l'andain n'existait peut-être pas")
                # Supprimer l'instance créée
                created_data = response.json()
                delete_response = requests.delete(f"{API_URL}{created_data['id']}/", headers=headers)
                print(f"Suppression: {delete_response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur Django")
        print("Assurez-vous que le serveur Django est en cours d'exécution")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False
    
    return False

def test_creation_avec_andain_unique():
    """Test de création avec un andain unique (doit réussir)"""
    print("\n=== Test 2: Création avec andain unique ===")
    
    data = {
        "andain_numero": 9999,  # Numéro très probablement unique
        "plateforme": 7,
        "melange": 2,
        "volume_initial_m3": 100.0,
        "volume_restant_m3": 100.0,
        "statut": "en_cours",
        "date_mise_en_andains": "2025-10-07"
    }
    
    try:
        response = requests.post(API_URL, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Création réussie avec andain unique")
            created_data = response.json()
            print(f"ID créé: {created_data.get('id')}")
            
            # Supprimer l'instance créée pour nettoyer
            delete_response = requests.delete(f"{API_URL}{created_data['id']}/", headers=headers)
            print(f"✅ Nettoyage: {delete_response.status_code}")
            return True
            
        else:
            print(f"❌ Échec inattendu: {response.status_code}")
            if response.status_code == 400:
                error_data = response.json()
                print("Erreurs:")
                print(json.dumps(error_data, indent=2))
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False
    
    return False

if __name__ == "__main__":
    print("🔍 Test de résolution de l'erreur 400 pour création de suivi stock")
    print("=" * 60)
    
    # Note: Ces tests nécessitent un token d'authentification valide
    print("⚠️ Note: Ces tests nécessitent un token d'authentification valide")
    print("Modifiez la variable TOKEN ci-dessus avec un token valide\n")
    
    # Exécuter les tests seulement si un token est fourni
    if TOKEN == "votre_token_ici":
        print("❌ Token d'authentification non configuré")
        print("Veuillez modifier le script avec un token valide")
    else:
        test1_result = test_creation_avec_andain_existant()
        test2_result = test_creation_avec_andain_unique()
        
        print("\n" + "=" * 60)
        print("📊 RÉSULTATS:")
        print(f"Test andain existant: {'✅ PASS' if test1_result else '❌ FAIL'}")
        print(f"Test andain unique: {'✅ PASS' if test2_result else '❌ FAIL'}")
        
        if test1_result and test2_result:
            print("\n🎉 Tous les tests passent! Le problème semble résolu.")
        else:
            print("\n⚠️ Certains tests échouent, vérification supplémentaire nécessaire.")