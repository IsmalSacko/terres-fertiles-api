#!/usr/bin/env python3
"""
Script de débogage pour analyser l'erreur 400 lors de la création de suivi de stock
"""

import requests
import json
from datetime import date, datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Données de test pour reproduire l'erreur
test_data = {
    "andain_numero": "A001",
    "plateforme": 1,  # ID d'une plateforme existante
    "melange": 1,     # ID d'un mélange existant
    "produit_vente": None,  # Peut être null
    "volume_initial_m3": 100.0,
    "volume_restant_m3": 100.0,
    "statut": "en_stock",
    "date_mise_en_andains": str(date.today()),
    "date_mise_en_culture": None,
    "date_previsionnelle_vente": None,
    "date_ecoulement": None,
    "recette": 0.0,
    "remarques": "Test de création"
}

def test_api_endpoints():
    """Tester les endpoints pour comprendre le problème"""
    
    print("=== TEST DES ENDPOINTS ===\n")
    
    # 1. Tester GET plateformes
    print("1. Test GET plateformes:")
    try:
        response = requests.get(f"{API_URL}/plateformes/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            plateformes = response.json()
            print(f"   Nombre de plateformes: {len(plateformes)}")
            if plateformes:
                print(f"   Première plateforme: ID={plateformes[0]['id']}, Nom={plateformes[0]['nom']}")
                test_data["plateforme"] = plateformes[0]["id"]
        else:
            print(f"   Erreur: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print()
    
    # 2. Tester GET mélanges
    print("2. Test GET mélanges:")
    try:
        response = requests.get(f"{API_URL}/melanges/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            melanges = response.json()
            print(f"   Nombre de mélanges: {len(melanges)}")
            if melanges:
                print(f"   Premier mélange: ID={melanges[0]['id']}, Nom={melanges[0]['nom']}")
                test_data["melange"] = melanges[0]["id"]
        else:
            print(f"   Erreur: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print()
    
    # 3. Tester GET suivi-stock existants
    print("3. Test GET suivi-stock-plateforme:")
    try:
        response = requests.get(f"{API_URL}/suivi-stock-plateforme/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            suivis = response.json()
            print(f"   Nombre de suivis existants: {len(suivis)}")
            if suivis:
                print(f"   Premier suivi: Andain={suivis[0].get('andain_numero')}, Plateforme={suivis[0].get('plateforme')}")
        else:
            print(f"   Erreur: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print()
    
    # 4. Tester POST suivi-stock avec les données actuelles
    print("4. Test POST suivi-stock-plateforme (reproduction de l'erreur):")
    print(f"   Données envoyées: {json.dumps(test_data, indent=2)}")
    
    try:
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        response = requests.post(
            f"{API_URL}/suivi-stock-plateforme/",
            json=test_data,
            headers=headers
        )
        
        print(f"   Status: {response.status_code}")
        print(f"   Headers de réponse: {dict(response.headers)}")
        
        if response.status_code >= 400:
            print("   === DÉTAILS DE L'ERREUR ===")
            try:
                error_data = response.json()
                print(f"   Erreur JSON: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Erreur texte: {response.text}")
        else:
            print("   Succès!")
            try:
                result = response.json()
                print(f"   Résultat: {json.dumps(result, indent=2)}")
            except:
                print(f"   Réponse: {response.text}")
                
    except Exception as e:
        print(f"   Exception lors de la requête: {e}")
    
    print()

def test_with_different_andain():
    """Tester avec différents numéros d'andain pour éviter les conflits"""
    
    print("=== TEST AVEC DIFFÉRENTS NUMÉROS D'ANDAIN ===\n")
    
    for i in range(1, 4):
        test_data_copy = test_data.copy()
        test_data_copy["andain_numero"] = f"TEST{i:03d}"
        
        print(f"Test {i}: Andain {test_data_copy['andain_numero']}")
        
        try:
            response = requests.post(
                f"{API_URL}/suivi-stock-plateforme/",
                json=test_data_copy,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code >= 400:
                try:
                    error_data = response.json()
                    print(f"   Erreur: {error_data}")
                except:
                    print(f"   Erreur: {response.text}")
            else:
                print("   ✅ Succès!")
                
        except Exception as e:
            print(f"   Exception: {e}")
        
        print()

if __name__ == "__main__":
    print("DIAGNOSTIC D'ERREUR 400 - SUIVI STOCK PLATEFORME")
    print("=" * 50)
    print()
    
    test_api_endpoints()
    test_with_different_andain()
    
    print("=" * 50)
    print("FIN DU DIAGNOSTIC")