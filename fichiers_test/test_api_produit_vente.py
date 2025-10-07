#!/usr/bin/env python
"""Test API pour vérifier la sérialisation des produits de vente"""
import requests
import json

# Lire le token
try:
    with open('auth_token.txt', 'r') as f:
        TOKEN = f.read().strip()
except FileNotFoundError:
    print("❌ Token non trouvé")
    exit(1)

API_URL = "http://localhost:8000/api/suivi-stock-plateforme/"
headers = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}

def test_api_produit_vente():
    """Tester l'API pour voir les détails des produits de vente"""
    print("🔍 Test API - Détails des produits de vente")
    print("=" * 50)
    
    try:
        response = requests.get(API_URL, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Type de données reçues: {type(data)}")
            
            # Gérer les deux formats possibles
            if isinstance(data, dict) and 'results' in data:
                suivis = data['results']
            elif isinstance(data, list):
                suivis = data
            else:
                suivis = []
            
            if suivis:
                print(f"📊 Nombre de suivis trouvés: {len(suivis)}")
                
                # Chercher un suivi avec produit de vente
                suivi_avec_produit = None
                for suivi in suivis:
                    if suivi.get('produit_vente'):
                        suivi_avec_produit = suivi
                        break
                
                if suivi_avec_produit:
                    print("\n📋 Suivi avec produit de vente:")
                    print(f"ID: {suivi_avec_produit.get('id')}")
                    print(f"Andain: {suivi_avec_produit.get('andain_numero')}")
                    print(f"Référence: {suivi_avec_produit.get('reference_suivi')}")
                    
                    # Détails du produit de vente
                    produit_details = suivi_avec_produit.get('produit_vente_details')
                    if produit_details:
                        print("\n🎯 Détails du produit de vente:")
                        print(json.dumps(produit_details, indent=2))
                    
                    print(f"\nProduit de vente ID: {suivi_avec_produit.get('produit_vente')}")
                else:
                    print("\n⚠️  Aucun suivi n'a de produit de vente associé")
                    
                    # Afficher le premier suivi comme exemple
                    premier_suivi = suivis[0]
                    print(f"\n📋 Premier suivi (sans produit de vente):")
                    print(f"ID: {premier_suivi.get('id')}")
                    print(f"Andain: {premier_suivi.get('andain_numero')}")
            else:
                print("⚠️  Aucun suivi de stock trouvé")
        else:
            print(f"❌ Erreur API: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_api_produit_vente()