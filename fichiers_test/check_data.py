#!/usr/bin/env python
"""
Script pour vérifier l'existence de plateformes dans la base de données
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from core.models import Plateforme, SuiviStockPlateforme

def check_plateformes():
    print("=== Vérification des plateformes ===")
    plateformes = Plateforme.objects.all()
    print(f"Nombre total de plateformes: {plateformes.count()}")
    
    for p in plateformes:
        print(f"ID: {p.id}, Nom: {p.nom}, Localisation: {p.localisation}")
    
    print("\n=== Vérification des suivis de stock ===")
    suivis = SuiviStockPlateforme.objects.all()
    print(f"Nombre total de suivis: {suivis.count()}")
    
    if suivis.count() > 0:
        print("Premiers suivis:")
        for s in suivis[:5]:
            print(f"ID: {s.id}, Andain: {s.andain_numero}, Plateforme: {s.plateforme.nom if s.plateforme else 'None'}")

if __name__ == "__main__":
    check_plateformes()