import os
from django.conf import settings
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.core.files.storage import default_storage
from django.db.models import Sum, F, Value
from django.db.models.functions import Coalesce, Greatest
from decimal import Decimal

from django.dispatch import receiver
from djoser.signals import user_activated

from .models import (DocumentGisement, DocumentTechnique, Melange, Chantier, Plateforme, SaisieVente, ProduitVente)

@receiver(user_activated)
def grant_staff_on_activation(sender, user, request, **kwargs):
    # Ajuste la condition selon tes rôles
    if getattr(user, "role", None) in ("exploitant", "entreprise"):
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=["is_staff"])
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
    if instance.commune:
        instance.commune = instance.commune.strip().upper()
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


###############################
# Mise à jour Volume Vendu PRD
###############################

def _to_m3(volume_tonne: Decimal | None) -> Decimal:
    """Convertit des tonnes en m³ avec densité par défaut 1.3 t/m³."""
    if not volume_tonne:
        return Decimal('0.00')
    densite = Decimal('1.3')
    return (Decimal(volume_tonne) / densite).quantize(Decimal('0.01'))


def _apply_delta_produit_volume_vendu(produit_id: int, delta_m3: Decimal) -> None:
    """Applique un delta (positif ou négatif) au volume_vendu du produit, sans jamais passer en dessous de 0."""
    if not produit_id or not delta_m3:
        return
    ProduitVente.objects.filter(id=produit_id).update(
        volume_vendu=Greatest(
            Coalesce(F('volume_vendu'), Value(Decimal('0')))
            + Value(delta_m3),
            Value(Decimal('0'))
        )
    )


@receiver(pre_save, sender=SaisieVente)
def saisie_vente_pre_save_capture_old(sender, instance: SaisieVente, **kwargs):
    """Capture l'ancien état pour calculer un delta après sauvegarde."""
    if instance.pk:
        try:
            old = SaisieVente.objects.get(pk=instance.pk)
            instance._old_est_validee = old.est_validee
            instance._old_volume_tonne = old.volume_tonne
        except SaisieVente.DoesNotExist:
            instance._old_est_validee = False
            instance._old_volume_tonne = Decimal('0')
    else:
        instance._old_est_validee = False
        instance._old_volume_tonne = Decimal('0')


@receiver(post_save, sender=SaisieVente)
def saisie_vente_post_save_update_produit(sender, instance: SaisieVente, created: bool, **kwargs):
    """Met à jour volume_vendu par delta selon création/modification et validation."""
    if not instance or not instance.produit_id:
        return

    new_valid = bool(instance.est_validee)
    new_m3 = _to_m3(instance.volume_tonne)

    old_valid = bool(getattr(instance, '_old_est_validee', False))
    old_m3 = _to_m3(getattr(instance, '_old_volume_tonne', Decimal('0')))

    if created:
        # Ajoute si validée à la création
        delta = new_m3 if new_valid else Decimal('0.00')
    else:
        # Delta = (nouvel état) - (ancien état)
        delta = (new_m3 if new_valid else Decimal('0.00')) - (old_m3 if old_valid else Decimal('0.00'))

    if delta != Decimal('0.00'):
        _apply_delta_produit_volume_vendu(instance.produit_id, delta)


@receiver(post_delete, sender=SaisieVente)
def saisie_vente_post_delete_update_produit(sender, instance: SaisieVente, **kwargs):
    """Soustrait le volume si la saisie supprimée était validée."""
    if not instance or not instance.produit_id:
        return
    if instance.est_validee:
        delta = -_to_m3(instance.volume_tonne)
        if delta != Decimal('0.00'):
            _apply_delta_produit_volume_vendu(instance.produit_id, delta)