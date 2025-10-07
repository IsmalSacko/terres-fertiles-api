#!/usr/bin/env python3
"""
Script de test pour vérifier l'API Suivi Stock
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_suivi_stock_api():
    """Test de l'API suivi stock"""
    
    # Test 1: Obtenir le token d'authentification
    print("=== Test 1: Authentification ===")
    login_data = {
        "username": "admin",  # Ajustez selon vos credentials
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"Token obtenu: {token[:20]}...")
            
            # Test 2: Obtenir la liste des suivis stock
            print("\n=== Test 2: Liste des suivis stock ===")
            headers = {'Authorization': f'Token {token}'}
            
            response = requests.get(f"{BASE_URL}/suivi-stock-plateforme/", headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Nombre d'items: {data.get('count', 0)}")
                print(f"Résultats: {len(data.get('results', []))}")
            else:
                print(f"Erreur: {response.text}")
                
        else:
            print(f"Échec connexion: {response.text}")
            
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    test_suivi_stock_api()