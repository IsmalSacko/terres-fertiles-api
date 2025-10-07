#!/usr/bin/env python
"""Script pour tester l'affichage correct des produits de vente"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'terres_fertiles.settings')
django.setup()

from core.models import ProduitVente, SuiviStockPlateforme

def test_produit_vente_display():
    """Tester l'affichage des produits de vente"""
    print("🧪 Test d'affichage des produits de vente")
    print("=" * 50)
    
    # Afficher quelques produits de vente
    produits = ProduitVente.objects.all()[:5]
    
    print(f"📊 Nombre total de produits de vente: {ProduitVente.objects.count()}")
    print("\n📋 Exemples de produits de vente:")
    print("-" * 40)
    
    for produit in produits:
        print(f"ID: {produit.id}")
        print(f"__str__(): {str(produit)}")
        print(f"Reference: {produit.reference_produit}")
        print(f"Fournisseur: {produit.fournisseur}")
        print(f"Volume disponible: {produit.volume_disponible}")
        if produit.melange:
            print(f"Mélange: {produit.melange.nom}")
        print("-" * 40)
    
    # Tester les suivis de stock avec produits de vente
    print("\n🔍 Suivis de stock avec produits de vente:")
    suivis_avec_produits = SuiviStockPlateforme.objects.filter(produit_vente__isnull=False)[:3]
    
    for suivi in suivis_avec_produits:
        print(f"Suivi #{suivi.id} - Andain {suivi.andain_numero}")
        print(f"Produit de vente: {str(suivi.produit_vente)}")
        print("-" * 30)
    
    if not suivis_avec_produits.exists():
        print("⚠️  Aucun suivi de stock n'a de produit de vente associé")
    
    return True

if __name__ == '__main__':
    test_produit_vente_display()