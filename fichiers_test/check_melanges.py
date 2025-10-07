#!/usr/bin/env python
"""
Script pour vérifier l'existence de mélanges dans la base de données
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from core.models import Melange, Plateforme

def check_melanges():
    print("=== Vérification des mélanges ===")
    melanges = Melange.objects.all()
    print(f"Nombre total de mélanges: {melanges.count()}")
    
    if melanges.count() > 0:
        print("Premiers mélanges:")
        for m in melanges[:5]:
            print(f"ID: {m.id}, Nom: {m.nom}, Plateforme: {m.plateforme.nom if m.plateforme else 'None'}, État: {m.etat}")
    else:
        print("❌ Aucun mélange trouvé dans la base de données !")
        print("Vous devez créer des mélanges pour qu'ils apparaissent dans le dropdown.")
    
    print("\n=== Vérification des plateformes ===")
    plateformes = Plateforme.objects.all()
    print(f"Nombre total de plateformes: {plateformes.count()}")
    
    if plateformes.count() > 0:
        print("Plateformes disponibles:")
        for p in plateformes:
            print(f"ID: {p.id}, Nom: {p.nom}")

if __name__ == "__main__":
    check_melanges()