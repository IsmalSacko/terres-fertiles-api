# tests/test_chantiers.py
from django.test import TestCase
from core.models import CustomUser, Chantier, Gisement

class ChantierGisementModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username="client1", password="pwd", role="client", company_name="EcoBuild")
        self.chantier = Chantier.objects.create(
            nom="Chantier A",
            utilisateur=self.user,
            maitre_ouvrage="Ville de Paris",
            entreprise_terrassement="BTP Co",
            localisation="Paris"
        )
        self.gisement = Gisement.objects.create(
            utilisateur=self.user,
            chantier=self.chantier,
            commune="Paris",
            periode_terrassement="2025",
            volume_terrasse=1000,
            materiau="Argile",
            localisation="Zone Est"
        )

    def test_chantier_str(self):
        self.assertEqual(str(self.chantier), "Chantier A")

    def test_gisement_auto_nom(self):
        self.assertTrue(self.gisement.nom.startswith("GIS-"))
