# tests/test_melanges.py
from django.test import TestCase
from core.models import CustomUser, Chantier, Gisement, Plateforme, Melange

class MelangeModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username="ent1", password="pwd", role="entreprise", company_name="Recyclo")
        self.plateforme = Plateforme.objects.create(nom="Plateforme Paris", localisation="Paris", responsable=self.user)
        self.chantier = Chantier.objects.create(nom="Chantier B", utilisateur=self.user, maitre_ouvrage="MO", entreprise_terrassement="TerrassCo", localisation="Lyon")
        self.gisement = Gisement.objects.create(utilisateur=self.user, chantier=self.chantier, commune="Lyon", periode_terrassement="2025", volume_terrasse=500, materiau="Terre", localisation="Nord")

        self.melange = Melange.objects.create(
            utilisateur=self.user,
            nom="Mélange Test",
            plateforme=self.plateforme,
            fournisseur="Recyclo",
            periode_melange="2025"
        )

    def test_melange_reference_generated(self):
        self.assertTrue(self.melange.reference_produit.startswith("MEL-"))

    def test_str_method(self):
        self.assertEqual(str(self.melange), f"Mélange {self.melange.nom}")

    def test_tache_actuelle(self):
        self.assertEqual(self.melange.tache_actuelle(), "Veuillez composer le mélange avec les gisements.")
