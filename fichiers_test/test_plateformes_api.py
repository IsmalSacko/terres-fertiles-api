#!/usr/bin/env python
"""
Script simple pour tester l'API des plateformes
"""
import requests
import json

def test_plateformes_api():
    """Test de l'API plateformes"""
    print("Test de l'endpoint /api/plateformes/")
    
    try:
        response = requests.get("http://localhost:8000/api/plateformes/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Nombre de plateformes: {len(data)}")
            print("Premières plateformes:")
            for p in data[:3]:
                print(f"  ID: {p['id']}, Nom: {p['nom']}, Localisation: {p['localisation']}")
        else:
            print(f"Erreur: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_plateformes_api()