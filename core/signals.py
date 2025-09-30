import os
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.core.files.storage import default_storage


from .models import (DocumentGisement, DocumentTechnique, AnalyseLaboratoire, Melange, Chantier, Plateforme, SaisieVente)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.get_or_create(user=instance)

### 🟢 FORCER CERTAINES CHAÎNES EN MAJUSCULES AVANT SAUVEGARDE ###
@receiver(pre_save, sender=Chantier)
def chantier_pre_save_uppercase(sender, instance, **kwargs):
    """Forcer certaines chaînes en MAJUSCULES juste avant la sauvegarde en DB."""
    if instance.maitre_ouvrage:
        instance.maitre_ouvrage = instance.maitre_ouvrage.strip().upper()
    if instance.entreprise_terrassement:
        instance.entreprise_terrassement = instance.entreprise_terrassement.strip().upper()
    if instance.commune:
        instance.commune = instance.commune.strip().upper()
    if instance.localisation:
        instance.localisation = instance.localisation.strip().upper()


### Forcer certaines chaînes en MAJUSCULES avant sauvegarde pour la plateforme

@receiver(pre_save, sender=Plateforme)
def plateforme_pre_save_uppercase(sender, instance, **kwargs):
    """Forcer certaines chaînes en MAJUSCULES juste avant la sauvegarde en DB."""
    if instance.nom:
        instance.nom = instance.nom.strip().upper()
    if instance.localisation:
        instance.localisation = instance.localisation.strip().upper()
    if instance.entreprise_gestionnaire:
        instance.entreprise_gestionnaire = instance.entreprise_gestionnaire.strip().upper()

### Forcer certaines chaînes en MAJUSCULES avant sauvegarde pour lE MELANGE
@receiver(pre_save, sender=Melange)
def melange_pre_save_uppercase(sender, instance, **kwargs):
    """Forcer certaines chaînes en MAJUSCULES juste avant la sauvegarde en DB."""
    if instance.nom:
        instance.nom = instance.nom.strip().upper()
    if instance.fournisseur:
        instance.fournisseur = instance.fournisseur.strip().upper()
    if instance.producteur:
        instance.producteur = instance.producteur.strip().upper()
    if instance.reference_produit:
        instance.reference_produit = instance.reference_produit.strip().upper()

### 🔴 SUPPRESSION DES FICHIERS APRÈS LA SUPPRESSION DES OBJETS ###

def delete_file_field(instance, field_name):
    file_field = getattr(instance, field_name)
    if file_field and file_field.name and default_storage.exists(file_field.name):
        file_field.delete(save=False)

# Suppression après suppression de l’objet
@receiver(post_delete, sender=DocumentGisement)
def delete_document_gisement_file(sender, instance, **kwargs):
    delete_file_field(instance, 'fichier')

@receiver(post_delete, sender=DocumentTechnique)
def delete_document_technique_file(sender, instance, **kwargs):
    delete_file_field(instance, 'fichier')

@receiver(post_delete, sender=AnalyseLaboratoire)
def delete_analyse_pdf_file(sender, instance, **kwargs):
    delete_file_field(instance, 'fichier_pdf')

@receiver(post_delete, sender=Melange)
def delete_melange_files(sender, instance, **kwargs):
    for field in ['ordre_conformite', 'consignes_melange', 'controle_1', 'controle_2', 'fiche_technique']:
        file_field = getattr(instance, field)
        if file_field and file_field.name:
            file_path = file_field.path
            file_field.delete(save=False)
            # Supprimer le dossier parent s'il est vide
            dir_path = os.path.dirname(file_path)
            try:
                if os.path.isdir(dir_path) and not os.listdir(dir_path):
                    os.rmdir(dir_path)
            except Exception:
                pass  # Ignore les erreurs si le dossier n'est pas vide ou autre


### 🟡 SUPPRESSION DE L’ANCIEN FICHIER EN CAS DE REMPLACEMENT ###

@receiver(pre_save, sender=DocumentGisement)
def replace_document_gisement_file(sender, instance, **kwargs):
    if not instance.pk:
        return  # Nouveau document : pas besoin de comparer
    try:
        old_file = DocumentGisement.objects.get(pk=instance.pk).fichier
    except DocumentGisement.DoesNotExist:
        return
    new_file = instance.fichier
    if old_file and old_file != new_file:
        if old_file.name and default_storage.exists(old_file.name):
            file_path = old_file.path
            old_file.delete(save=False)
            # Supprimer le dossier parent s'il est vide
            dir_path = os.path.dirname(file_path)
            try:
                if os.path.isdir(dir_path) and not os.listdir(dir_path):
                    os.rmdir(dir_path)
            except Exception:
                pass

@receiver(pre_save, sender=DocumentTechnique)
def replace_document_technique_file(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_file = DocumentTechnique.objects.get(pk=instance.pk).fichier
    except DocumentTechnique.DoesNotExist:
        return
    new_file = instance.fichier
    if old_file and old_file != new_file:
        if old_file.name and default_storage.exists(old_file.name):
            file_path = old_file.path
            old_file.delete(save=False)
            # Supprimer le dossier parent s'il est vide
            dir_path = os.path.dirname(file_path)
            try:
                if os.path.isdir(dir_path) and not os.listdir(dir_path):
                    os.rmdir(dir_path)
            except Exception:
                pass

@receiver(pre_save, sender=AnalyseLaboratoire)
def replace_analyse_pdf_file(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_file = AnalyseLaboratoire.objects.get(pk=instance.pk).fichier_pdf
    except AnalyseLaboratoire.DoesNotExist:
        return
    new_file = instance.fichier_pdf
    if old_file and old_file != new_file:
        if old_file.name and default_storage.exists(old_file.name):
            file_path = old_file.path
            old_file.delete(save=False)
            # Supprimer le dossier parent s'il est vide
            dir_path = os.path.dirname(file_path)
            try:
                if os.path.isdir(dir_path) and not os.listdir(dir_path):
                    os.rmdir(dir_path)
            except Exception:
                pass

@receiver(pre_save, sender=Melange)
def replace_melange_files(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = Melange.objects.get(pk=instance.pk)
    except Melange.DoesNotExist:
        return
    for field in ['ordre_conformite', 'consignes_melange', 'controle_1', 'controle_2', 'fiche_technique']:
        old_file = getattr(old_instance, field)
        new_file = getattr(instance, field)
        if old_file and old_file != new_file:
            if old_file.name and default_storage.exists(old_file.name):
                file_path = old_file.path
                old_file.delete(save=False)
                # Supprimer le dossier parent s'il est vide
                dir_path = os.path.dirname(file_path)
                try:
                    if os.path.isdir(dir_path) and not os.listdir(dir_path):
                        os.rmdir(dir_path)
                except Exception:
                    pass

@receiver(post_delete, sender=SaisieVente)
def delete_unused_chantier(sender, instance, **kwargs):
    chantier = instance.chantier
    if chantier and not chantier.saisievente_set.exists():
        chantier.delete()