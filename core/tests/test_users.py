# tests/test_users.py
from django.test import TestCase
from core.models import CustomUser

class CustomUserModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="exploitant1",
            password="test1234",
            role="exploitant",
            company_name="GreenTech",
            siret_number="12345678900011"
        )

    def test_str_method(self):
        self.assertEqual(str(self.user), "exploitant1 (Exploitant)")

    def test_role_display(self):
        self.assertEqual(self.user.get_role_display(), "Exploitant")
