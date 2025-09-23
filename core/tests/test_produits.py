# tests/test_produits.py
from django.test import TestCase
from decimal import Decimal
from core.models import CustomUser, Melange, Plateforme, ProduitVente

class ProduitVenteModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username="ent2", password="pwd", role="entreprise", company_name="SoilTech")
        self.plateforme = Plateforme.objects.create(nom="Plateforme Sud", localisation="Marseille", responsable=self.user)
        self.melange = Melange.objects.create(utilisateur=self.user, nom="Mélange Produit", plateforme=self.plateforme, fournisseur="SoilTech", periode_melange="2025")

        self.produit = ProduitVente.objects.create(
            utilisateur=self.user,
            reference_produit="P001",
            melange=self.melange,
            fournisseur="SoilTech",
            volume_initial=Decimal("100.00"),
            volume_vendu=Decimal("20.00")
        )

    def test_volume_disponible_property(self):
        self.assertEqual(self.produit.volume_disponible, Decimal("80.00"))
