from datetime import datetime
import unicodedata
import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def format_nom_gisement(nom: str) -> str:
    nom = unicodedata.normalize('NFD', nom).encode('ascii', 'ignore').decode("utf-8")
    nom = re.sub(r'\W+', '', nom)  # Supprime les caractères non alphanumériques
    return nom.upper()


def document_upload_path(instance, filename):
    from .models import DocumentGisement 
    prefix = datetime.now().strftime('%y')
    nom_sans_accent = format_nom_gisement(instance.gisement.commune)
    count = DocumentGisement.objects.filter(gisement=instance.gisement).count() + 1
    num = str(count).zfill(2)
    ext = filename.split('.')[-1]
    new_name = f"{prefix}{nom_sans_accent}_{num}.{ext}"
    return f"documents/gisements/{instance.gisement.id}/{new_name}"


from rest_framework import permissions

class HasCustomAccessPermission(permissions.BasePermission):
    """
    Permission personnalisée : accès si l'utilisateur est une entreprise,
    appartient au groupe 'terres fertiles', est staff ou superuser.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and (
                user.role == 'entreprise' or
                user.groups.filter(name='terres fertiles').exists() or
                user.is_superuser or
                user.is_staff
            )
        )


class IsExploitantOrEntrepriseOrStaffOrSuperuser(permissions.BasePermission):
    """
    Accès pour exploitant, entreprise, staff ou superuser.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and (
                user.role in ['exploitant', 'entreprise'] or
                user.is_superuser or
                user.is_staff
            )
        )


class IsClientOrEntrepriseOrStaffOrSuperuser(permissions.BasePermission):
    """
    Accès pour client, entreprise, staff ou superuser.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and (
                user.role in ['client', 'entreprise'] or
                user.is_superuser
            )
        )


class IsEntrepriseOrSuperUser(permissions.BasePermission):
    """
    Accès réservé à l'entreprise ou superuser.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and (
                user.role == 'entreprise' or
                user.is_superuser
            )
        )


class IsExploitant(permissions.BasePermission):
    """
    Accès réservé à l'exploitant ou superuser.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and (
                user.role == 'exploitant' or
                user.is_superuser or user.role == 'entreprise'
            )
        )


def build_absolute_link(path: str) -> str:
    """Construit une URL absolue vers le frontend à partir d'un path relatif.

    Choisit automatiquement le scheme (http pour localhost/127.0.0.1, https sinon)
    et nettoie les slashes en trop.
    Exemple:
        build_absolute_link('reset-password-confirm/{uid}/{token}')
    """
    from django.conf import settings

    domain = getattr(settings, 'DOMAIN', '') or ''
    domain = str(domain).rstrip('/')
    scheme = 'http' if ('localhost' in domain or '127.0.0.1' in domain) else 'https'
    path = str(path).lstrip('/')
    return f"{scheme}://{domain}/{path}"



# utils.py ou directement dans models.py
import unicodedata
import re

def normalize_filename(filename):
    # transforme é à e, ç à c, etc.
    filename = unicodedata.normalize('NFKD', filename).encode('ascii', 'ignore').decode('ascii')
    # optionnel : remplacer tout caractère spécial par _
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    return filename

