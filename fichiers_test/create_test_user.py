#!/usr/bin/env python3
"""
Script pour créer un utilisateur de test
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from core.models import CustomUser

def create_test_user():
    """Créer un utilisateur de test"""
    
    try:
        # Supprimer l'utilisateur existant s'il existe
        CustomUser.objects.filter(username='testadmin').delete()
        
        # Créer le nouvel utilisateur
        user = CustomUser.objects.create_user(
            username='testadmin',
            email='test@admin.com',
            password='testpass123',
            role='admin',
            is_superuser=True,
            is_staff=True,
            is_active=True
        )
        
        print(f"✅ Utilisateur créé avec succès:")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   Is superuser: {user.is_superuser}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return False

if __name__ == "__main__":
    print("CRÉATION D'UN UTILISATEUR DE TEST")
    print("=" * 35)
    create_test_user()
    print("=" * 35)