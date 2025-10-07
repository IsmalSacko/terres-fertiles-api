#!/usr/bin/env python3
"""
Script pour vérifier les données SuiviStockPlateforme
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from core.models import SuiviStockPlateforme, Plateforme, Melange

def check_suivi_stock_data():
    """Vérifier les données de suivi stock"""
    
    print("=== Vérification des données SuiviStockPlateforme ===")
    
    # Compter les entrées
    count = SuiviStockPlateforme.objects.count()
    print(f"Nombre total de suivis de stock: {count}")
    
    if count > 0:
        # Afficher quelques exemples
        print("\n=== Premiers exemples ===")
        for suivi in SuiviStockPlateforme.objects.all()[:5]:
            print(f"ID: {suivi.id}")
            print(f"Andain: {suivi.andain_numero}")
            print(f"Référence: {suivi.reference_suivi}")
            print(f"Plateforme: {suivi.plateforme}")
            print(f"Mélange: {suivi.melange}")
            print(f"Statut: {suivi.statut}")
            print("-" * 40)
    else:
        print("Aucune donnée trouvée. Création d'un exemple...")
        
        # Vérifier les plateformes
        plateformes = Plateforme.objects.all()[:1]
        melanges = Melange.objects.all()[:1]
        
        print(f"Plateformes disponibles: {plateformes.count()}")
        print(f"Mélanges disponibles: {melanges.count()}")
        
        if plateformes.exists() and melanges.exists():
            # Créer un exemple
            suivi = SuiviStockPlateforme.objects.create(
                andain_numero=1,
                reference_suivi="SUIVI-TEST-001",
                plateforme=plateformes.first(),
                melange=melanges.first(),
                volume_initial_m3=100.0,
                volume_restant_m3=80.0,
                statut='en_cours',
                remarques="Test créé automatiquement"
            )
            print(f"Suivi créé: {suivi.reference_suivi}")
        else:
            print("Impossible de créer un exemple - manque plateformes ou mélanges")

if __name__ == "__main__":
    check_suivi_stock_data()