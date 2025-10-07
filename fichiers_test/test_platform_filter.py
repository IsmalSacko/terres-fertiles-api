#!/usr/bin/env python
"""
Script de test pour vérifier le filtrage par plateforme dans l'API SuiviStockPlateforme
"""
import os
import django
import requests
from django.test import TestCase

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

# Test de l'API
def test_statistiques_api():
    """Test de l'endpoint statistiques avec différents paramètres"""
    base_url = "http://localhost:8000/api/suivi-stock-plateforme/statistiques/"
    
    # Test 1: Sans paramètre (devrait fonctionner)
    print("Test 1: Sans paramètre plateforme")
    try:
        response = requests.get(base_url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ OK - Requête sans paramètre fonctionne")
            data = response.json()
            print(f"Données reçues: {data}")
        else:
            print(f"❌ Erreur: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Avec paramètre plateforme valide (par exemple 1)
    print("Test 2: Avec paramètre plateforme valide (1)")
    try:
        response = requests.get(f"{base_url}?plateforme=1")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ OK - Requête avec plateforme=1 fonctionne")
            data = response.json()
            print(f"Données reçues: {data}")
        else:
            print(f"❌ Erreur: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: Avec paramètre plateforme vide (devrait être ignoré maintenant)
    print("Test 3: Avec paramètre plateforme vide")
    try:
        response = requests.get(f"{base_url}?plateforme=")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ OK - Requête avec plateforme vide fonctionne (paramètre ignoré)")
            data = response.json()
            print(f"Données reçues: {data}")
        else:
            print(f"❌ Erreur: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 4: Avec paramètre plateforme non-numérique (devrait être ignoré maintenant)
    print("Test 4: Avec paramètre plateforme non-numérique")
    try:
        response = requests.get(f"{base_url}?plateforme=abc")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ OK - Requête avec plateforme non-numérique fonctionne (paramètre ignoré)")
            data = response.json()
            print(f"Données reçues: {data}")
        else:
            print(f"❌ Erreur: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")


if __name__ == "__main__":
    print("Test de l'API SuiviStockPlateforme - Endpoint statistiques")
    print("="*60)
    test_statistiques_api()
    print("\n" + "="*60)
    print("Tests terminés!")