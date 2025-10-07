#!/usr/bin/env python
"""Script pour générer un token d'authentification pour les tests"""
import os
import django
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def create_or_get_token():
    """Créer ou récupérer un token pour le premier utilisateur"""
    try:
        user = User.objects.first()
        if not user:
            print("❌ Aucun utilisateur trouvé dans la base de données")
            return None
        
        token, created = Token.objects.get_or_create(user=user)
        
        print(f"✅ Token pour l'utilisateur '{user.username}':")
        print(f"Token: {token.key}")
        
        # Sauvegarder dans un fichier pour utilisation dans les tests
        with open('auth_token.txt', 'w') as f:
            f.write(token.key)
        
        print("✅ Token sauvegardé dans 'auth_token.txt'")
        return token.key
        
    except Exception as e:
        print(f"❌ Erreur lors de la création du token: {e}")
        return None

if __name__ == '__main__':
    print("🔑 Génération du token d'authentification")
    print("=" * 40)
    create_or_get_token()