from datetime import datetime
import unicodedata
import re


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
