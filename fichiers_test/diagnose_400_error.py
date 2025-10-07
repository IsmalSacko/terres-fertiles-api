#!/usr/bin/env python3
"""
Script de diagnostic avancé pour identifier la cause de l'erreur 400
"""

import os
import sys
import django
import requests
import json
from datetime import datetime, date

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from core.models import SuiviStockPlateforme, Plateforme, Melange, ProduitVente
from django.db import IntegrityError

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
            response_data = response.json()
            token = response_data.get('auth_token')
            if token:
                print(f"✅ Token obtenu avec succès")
                return token
        
        print(f"❌ Erreur d'authentification: {response.status_code}")
        return None
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def check_existing_records():
    """Vérifier les enregistrements existants pour détecter les conflits"""
    print("🔍 Vérification des enregistrements existants...")
    
    # Rechercher des enregistrements avec andain_numero=3 et plateforme=7
    existing = SuiviStockPlateforme.objects.filter(
        andain_numero=3,
        plateforme_id=7
    )
    
    if existing.exists():
        print(f"⚠️  {existing.count()} enregistrement(s) trouvé(s) avec andain_numero=3 et plateforme=7:")
        for record in existing:
            print(f"   - ID: {record.id}, Statut: {record.statut}, Date création: {record.date_creation}")
        return True
    else:
        print("✅ Aucun conflit détecté pour andain_numero=3 et plateforme=7")
        return False

def verify_foreign_keys():
    """Vérifier que les clés étrangères existent"""
    print("🔍 Vérification des clés étrangères...")
    
    issues = []
    
    # Vérifier plateforme ID 7
    try:
        plateforme = Plateforme.objects.get(id=7)
        print(f"✅ Plateforme ID 7: {plateforme.nom}")
    except Plateforme.DoesNotExist:
        print("❌ Plateforme ID 7 introuvable")
        issues.append("Plateforme ID 7 n'existe pas")
    
    # Vérifier melange ID 2
    try:
        melange = Melange.objects.get(id=2)
        print(f"✅ Melange ID 2: {melange.nom}")
    except Melange.DoesNotExist:
        print("❌ Melange ID 2 introuvable")
        issues.append("Melange ID 2 n'existe pas")
    
    # Vérifier produit_vente ID 1
    try:
        produit = ProduitVente.objects.get(id=1)
        print(f"✅ ProduitVente ID 1: {produit.reference_produit}")
    except ProduitVente.DoesNotExist:
        print("❌ ProduitVente ID 1 introuvable")
        issues.append("ProduitVente ID 1 n'existe pas")
    
    return issues

def test_api_creation_with_details():
    """Tester la création via API avec capture détaillée des erreurs"""
    token = get_auth_token()
    if not token:
        return False
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    # Utiliser des données similaires à l'Angular mais avec un andain différent
    test_data = {
        'andain_numero': 5,  # Numéro différent pour éviter les conflits
        'plateforme': 7,
        'melange': 2,
        'produit_vente': 1,
        'volume_initial_m3': 452.0,
        'volume_restant_m3': 42.0,
        'statut': 'en_culture',
        'date_mise_en_andains': '2025-10-06',
        'date_mise_en_culture': '2025-10-06',
        'date_previsionnelle_vente': '2025-10-06',
        'date_ecoulement': '2025-10-06',
        'recette': None,
        'remarques': None
    }
    
    print("📤 Test avec andain_numero=5:")
    print(json.dumps(test_data, indent=2))
    
    try:
        response = requests.post(
            f'{API_BASE_URL}/api/suivi-stock-plateforme/',
            headers=headers,
            json=test_data
        )
        
        print(f"\n📡 Status Code: {response.status_code}")
        
        if response.status_code == 201:
            created_data = response.json()
            print("✅ Création réussie!")
            print("📦 Réponse:")
            print(json.dumps(created_data, indent=2))
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            try:
                error_data = response.json()
                print("📦 Détails de l'erreur:")
                print(json.dumps(error_data, indent=2))
            except:
                print("📦 Réponse brute:")
                print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erreur de requête: {e}")
        return False

def test_with_original_data():
    """Tester avec les données exactes de l'Angular qui causent l'erreur"""
    token = get_auth_token()
    if not token:
        return False
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    # Données exactes du log Angular
    original_data = {
        'andain_numero': 3,
        'plateforme': 7,
        'melange': 2,
        'produit_vente': 1,
        'volume_initial_m3': 452,
        'volume_restant_m3': 42,
        'statut': 'en_culture',
        'date_mise_en_andains': '2025-10-06',
        'date_mise_en_culture': '2025-10-06',
        'date_previsionnelle_vente': '2025-10-06',
        'date_ecoulement': '2025-10-06',
        'recette': None,
        'remarques': None
    }
    
    print("📤 Test avec données exactes Angular:")
    print(json.dumps(original_data, indent=2))
    
    try:
        response = requests.post(
            f'{API_BASE_URL}/api/suivi-stock-plateforme/',
            headers=headers,
            json=original_data
        )
        
        print(f"\n📡 Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Création réussie!")
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            try:
                error_data = response.json()
                print("📦 Détails de l'erreur:")
                print(json.dumps(error_data, indent=2))
            except:
                print("📦 Réponse brute:")
                print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erreur de requête: {e}")
        return False

def main():
    print("🔍 Diagnostic avancé de l'erreur 400 Bad Request")
    print("=" * 60)
    
    # Étape 1: Vérifier les conflits
    conflicts = check_existing_records()
    
    # Étape 2: Vérifier les clés étrangères
    fk_issues = verify_foreign_keys()
    
    # Étape 3: Tester avec des données différentes
    print("\n" + "=" * 60)
    print("🧪 Test avec données modifiées")
    success_alt = test_api_creation_with_details()
    
    # Étape 4: Tester avec les données exactes
    print("\n" + "=" * 60)
    print("🧪 Test avec données exactes Angular")
    success_orig = test_with_original_data()
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DU DIAGNOSTIC")
    print("=" * 60)
    
    if conflicts:
        print("⚠️  CONFLIT DÉTECTÉ: Un enregistrement avec andain_numero=3 et plateforme=7 existe déjà")
        print("💡 SOLUTION: L'utilisateur doit choisir un numéro d'andain différent")
    
    if fk_issues:
        print("❌ PROBLÈMES DE CLÉS ÉTRANGÈRES:")
        for issue in fk_issues:
            print(f"   - {issue}")
    
    if success_alt and not success_orig:
        print("✅ La création fonctionne avec des données différentes")
        print("❌ La création échoue avec les données exactes Angular")
        print("💡 PROBLÈME: Contrainte d'unicité ou données spécifiques")
    
    if not success_alt and not success_orig:
        print("❌ La création échoue dans tous les cas")
        print("💡 PROBLÈME: Configuration ou données de base")

if __name__ == '__main__':
    main()