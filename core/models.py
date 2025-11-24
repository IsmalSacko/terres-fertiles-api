from decimal import Decimal
import re

from django.utils.text import slugify
from datetime import date
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models, transaction

# models.py
from datetime import date
def today():
    return date.today()



class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('exploitant', 'Exploitant'),
        ('entreprise', 'Entreprise'),
        ('client', 'Client'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    company_name = models.CharField("Nom de l'entreprise", max_length=255)
    siret_number = models.CharField("SIRET", max_length=14, unique=True, null=True, blank=True)
    address = models.CharField("Adresse", max_length=255, null=True, blank=True)
    city = models.CharField("Ville", max_length=100, null=True, blank=True)
    postal_code = models.CharField("Code postal", max_length=10, null=True, blank=True)
    country = models.CharField("Pays", max_length=100, null=True, blank=True)
    phone_number = models.CharField("Téléphone", max_length=15, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    class Meta:
        db_table = 'utilisateur'
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['username']


class Chantier(models.Model):
    nom = models.CharField("Nom du chantier", max_length=255, null=True, blank=True, help_text="Nom du chantier, généré automatiquement si vide.", editable=False, unique=True)
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='chantiers', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    maitre_ouvrage = models.CharField(max_length=255)
    commune = models.CharField(max_length=100, null=True, blank=True)
    entreprise_terrassement = models.CharField(max_length=255)
    date_creation = models.DateField(default=today)
    is_active = models.BooleanField(default=True) 
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
 
    def save(self, *args, **kwargs):
        pattern = r"^CHA-\d{2}-[A-Z0-9]{2,6}-[A-Z0-9]{3}-\d{3}$"
        if self.maitre_ouvrage:
            self.maitre_ouvrage = self.maitre_ouvrage.upper()
        if self.entreprise_terrassement:
            self.entreprise_terrassement = self.entreprise_terrassement.upper()
        if self.commune:
            self.commune = self.commune.upper()

        regenerer = False

        if not self.pk:
            # ➡️ Cas CREATION
            regenerer = True
        else:
            # ➡️ Cas MODIFICATION - Vérifier si les champs clés ont changé
            if not re.match(pattern, self.nom or ""):
                regenerer = True
            else:
                # Récupérer l'instance originale pour comparer les changements
                try:
                    original = Chantier.objects.get(pk=self.pk)
                    
                    # Vérifier si les champs utilisés pour générer le nom ont changé
                    annee_actuelle = str(self.date_creation.year if self.date_creation else date.today().year)[-2:]
                    annee_originale = str(original.date_creation.year if original.date_creation else date.today().year)[-2:]
                    
                    terrassier_actuel = re.sub(r'[^A-Z0-9]', '', slugify(self.entreprise_terrassement).upper())[:3]
                    terrassier_original = re.sub(r'[^A-Z0-9]', '', slugify(original.entreprise_terrassement).upper())[:3]
                    
                    commune_actuelle = re.sub(r'[^A-Z0-9]', '', self.commune or "")[:3]
                    commune_originale = re.sub(r'[^A-Z0-9]', '', original.commune or "")[:3]
                    
                    # Si l'un des composants du nom a changé, régénérer
                    if (annee_actuelle != annee_originale or 
                        terrassier_actuel != terrassier_original or 
                        commune_actuelle != commune_originale):
                        regenerer = True
                        
                except Chantier.DoesNotExist:
                    regenerer = True
                
                # Si nom déjà utilisé par un autre chantier → régénérer
                if Chantier.objects.exclude(pk=self.pk).filter(nom=self.nom).exists():
                    regenerer = True

        if regenerer:
            with transaction.atomic():  # sécurité multi-utilisateurs pour éviter les doublons
                if self.pk:
                    # Pour une modification, conserver le numéro séquentiel existant
                    self.nom = self._generate_nom_with_existing_suffix()
                else:
                    # Pour une création, générer un nouveau numéro
                    self.nom = self._generate_nom(reindex=True)

        super().save(*args, **kwargs)
        
    def _generate_nom(self, reindex=False):
        """Génère un nom unique pour l'année et réindexe tous les suffixes si demandé"""
        # Prendre les 2 derniers chiffres de l'année
        annee = str(self.date_creation.year if self.date_creation else date.today().year)[-2:]

        # ✅ Modification : prendre seulement les 3 premiers caractères du code terrassement
        terrassier = re.sub(r'[^A-Z0-9]', '', slugify(self.entreprise_terrassement).upper())[:3]

        # Code commune : 3 premiers caractères
        commune = re.sub(r'[^A-Z0-9]', '', self.commune or "")[:3]  # pas de slugify ici

        base_nom_prefix = f"CHA-{annee}-"

        # Récupère tous les chantiers de l'année, triés par nom
        existing_chantiers = list(
            Chantier.objects.exclude(pk=self.pk)
            .filter(nom__startswith=base_nom_prefix)
            .order_by('nom')
        )

        # Réindexe tous les suffixes existants
        if reindex and existing_chantiers:
            for index, chantier in enumerate(existing_chantiers, start=1):
                match = re.match(r"(CHA-\d{2}-[A-Z0-9]{2,6}-[A-Z0-9]{3})-\d{3}", chantier.nom)
                if match:
                    new_nom = f"{match.group(1)}-{index:03d}"
                    if chantier.nom != new_nom:
                        chantier.nom = new_nom
                        chantier.save(update_fields=['nom'])

        # Nouveau suffixe = nombre de chantiers existants + 1
        suffix = len(existing_chantiers) + 1
        unique_nom = f"{base_nom_prefix}{terrassier}-{commune}-{suffix:03d}"
        return unique_nom

    def _generate_nom_with_existing_suffix(self):
        """Génère un nom en conservant le numéro séquentiel existant lors d'une modification"""
        # Extraire le suffixe existant du nom actuel
        current_suffix = "001"  # valeur par défaut
        if self.nom:
            match = re.search(r"-(\d{3})$", self.nom)
            if match:
                current_suffix = match.group(1)
        
        # Prendre les 2 derniers chiffres de l'année
        annee = str(self.date_creation.year if self.date_creation else date.today().year)[-2:]

        # Code terrassement : 3 premiers caractères
        terrassier = re.sub(r'[^A-Z0-9]', '', slugify(self.entreprise_terrassement).upper())[:3]

        # Code commune : 3 premiers caractères
        commune = re.sub(r'[^A-Z0-9]', '', self.commune or "")[:3]

        # Générer le nouveau nom avec l'ancien suffixe
        new_nom = f"CHA-{annee}-{terrassier}-{commune}-{current_suffix}"
        
        # Vérifier que ce nouveau nom n'existe pas déjà (avec un autre chantier)
        if Chantier.objects.exclude(pk=self.pk).filter(nom=new_nom).exists():
            # Si conflit, utiliser la méthode normale pour générer un nouveau suffixe
            return self._generate_nom(reindex=True)
        
        return new_nom

    def __str__(self):
        try:
            return f"{self.nom}" if self.nom else f"Gisement {self.pk}"
        except Exception:
            return f"Gisement {getattr(self, 'pk', 'n/a')}"

    def __str__(self):
        # Afficher le nom du gisement si disponible, sinon fallback sur l'ID
        try:
            return f"{self.nom}" if self.nom else f"Gisement {self.pk}"
        except Exception:
            return f"Gisement {getattr(self, 'pk', 'n/a')}"

    def __str__(self):
        return f"{self.nom}"

    class Meta:
        db_table = 'chantier'
        verbose_name = "Chantier"
        verbose_name_plural = "Chantiers"
        ordering = ['nom']


class Gisement(models.Model):
    TYPE_SOL_CHOICES = [
        ('naturel', 'Naturel'),
        ('remanie', 'Remanié'),
        ('anthropique', 'Anthropique'),
        ('autre', 'Autre'),
    ]


    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gisements',
        help_text="Responsable automatiquement défini à l'utilisateur connecté."
    )
    nom = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Nom du gisement, généré automatiquement si vide.",
        editable=False,
        unique=True
    )
    date_creation = models.DateField(default=today, help_text="Date de création du gisement")
    chantier = models.ForeignKey(Chantier, on_delete=models.CASCADE, related_name='gisements')
    commune = models.CharField(max_length=100)
    periode_terrassement = models.CharField(max_length=100) 
    volume_terrasse = models.DecimalField(max_digits=10, decimal_places=2)
    materiau = models.CharField(max_length=255)
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    type_de_sol = models.CharField(max_length=20, choices=TYPE_SOL_CHOICES, default='naturel')

    def save(self, *args, **kwargs):
        regenerer = False

        if not self.pk:
            # Création
            regenerer = True
        else:
            # Modification : vérifier si les champs clés ont changé
            pattern = r"^GIS-\d{2}-[A-Z0-9]{2,6}-[A-Z0-9]{2,6}-\d{3}$"
            if not re.match(pattern, self.nom or ""):
                regenerer = True
            else:
                # Récupérer l'instance originale pour comparer les changements
                try:
                    original = Gisement.objects.get(pk=self.pk)
                    
                    # Vérifier si les champs utilisés pour générer le nom ont changé
                    annee_actuelle = str(self.date_creation.year)[-2:]
                    annee_originale = str(original.date_creation.year)[-2:]
                    
                    # Comparer les chantiers associés
                    chantier_change = self.chantier != original.chantier
                    
                    # Si l'un des composants du nom a changé, régénérer
                    if (annee_actuelle != annee_originale or chantier_change):
                        regenerer = True
                        
                except Gisement.DoesNotExist:
                    regenerer = True
                
                # Vérifier unicité
                if Gisement.objects.exclude(pk=self.pk).filter(nom=self.nom).exists():
                    regenerer = True

        if regenerer and self.chantier:
            with transaction.atomic():
                if self.pk:
                    # Pour une modification, conserver le numéro séquentiel existant
                    self.nom = self._generate_nom_with_existing_suffix()
                else:
                    # Pour une création, générer un nouveau numéro
                    self.nom = self._generate_nom(reindex=True)

        # Normalisation
        if self.commune:
            self.commune = self.commune.upper()
        if self.materiau:
            self.materiau = self.materiau.upper()

        super().save(*args, **kwargs)


    def _generate_nom(self, reindex=False):
        annee = str(self.date_creation.year)[-2:]

        # Codes chantier
        chantier_parts = self.chantier.nom.split('-')
        terrassier_code = slugify(chantier_parts[2]).replace('-', '').upper() if len(chantier_parts) > 2 else "UNK"
        commune_code = slugify(chantier_parts[3]).replace('-', '').upper() if len(chantier_parts) > 3 else "UNK"

        base_nom_prefix = f"GIS-{annee}-{terrassier_code}-{commune_code}"

        # Tous les gisements de l'année pour la numérotation globale
        existing_gisements = list(
            Gisement.objects.exclude(pk=self.pk)
            .filter(date_creation__year=self.date_creation.year)
            .order_by('nom')
        )

        # Réindexer si demandé (tous les gisements de l'année)
        if reindex and existing_gisements:
            for index, gisement in enumerate(existing_gisements, start=1):
                match = re.match(r"(GIS-\d{2}-[A-Z0-9]{2,6}-[A-Z0-9]{2,6})-(\d{3})", gisement.nom)
                if match:
                    new_nom = f"{match.group(1)}-{index:03d}"
                    if gisement.nom != new_nom:
                        gisement.nom = new_nom
                        gisement.save(update_fields=['nom'])

        # Déterminer le suffixe : +1 du dernier suffixe existant global
        if existing_gisements:
            last_suffix = 0
            for g in reversed(existing_gisements):
                match = re.search(r"-(\d{3})$", g.nom)
                if match:
                    last_suffix = int(match.group(1))
                    break
            suffix = last_suffix + 1
        else:
            suffix = 1

        unique_nom = f"{base_nom_prefix}-{suffix:03d}"
        return unique_nom

    def _generate_nom_with_existing_suffix(self):
        """Génère un nom en conservant le numéro séquentiel existant lors d'une modification"""
        # Extraire le suffixe existant du nom actuel
        current_suffix = "001"  # valeur par défaut
        if self.nom:
            match = re.search(r"-(\d{3})$", self.nom)
            if match:
                current_suffix = match.group(1)
        
        annee = str(self.date_creation.year)[-2:]

        # Codes chantier
        chantier_parts = self.chantier.nom.split('-')
        terrassier_code = slugify(chantier_parts[2]).replace('-', '').upper() if len(chantier_parts) > 2 else "UNK"
        commune_code = slugify(chantier_parts[3]).replace('-', '').upper() if len(chantier_parts) > 3 else "UNK"

        # Générer le nouveau nom avec l'ancien suffixe
        new_nom = f"GIS-{annee}-{terrassier_code}-{commune_code}-{current_suffix}"
        
        # Vérifier que ce nouveau nom n'existe pas déjà (avec un autre gisement)
        if Gisement.objects.exclude(pk=self.pk).filter(nom=new_nom).exists():
            # Si conflit, utiliser la méthode normale pour générer un nouveau suffixe
            return self._generate_nom(reindex=True)
        
        return new_nom

    class Meta:
        db_table = 'gisement'
        verbose_name = "Gisement"
        verbose_name_plural = "Gisements"
        ordering = ['-periode_terrassement']

    def __str__(self):
        return f"{self.nom}"

class FicheAgroPedodeSol(models.Model):
    EAP = models.CharField("Etude Agro Pedo", max_length=100, unique=True, blank=True, null=True)
    
    ville = models.CharField(max_length=100, blank=True, null=True)
    projet = models.CharField(max_length=100, blank=True, null=True)
    date = models.DateField(auto_now_add=True)  # Date de création automatique
    commanditaire = models.CharField(max_length=100, blank=True, null=True)
    observateur = models.CharField(max_length=100, blank=True, null=True)
    nom_sondage = models.CharField(max_length=50)  # Obligatoire, sert de référence
    coord_x = models.FloatField(blank=True, null=True)  # Rempli côté Angular (GPS)
    coord_y = models.FloatField(blank=True, null=True)  # Rempli côté Angular (GPS)
    indication_lieu = models.TextField(blank=True, null=True)
    antecedent_climatique = models.TextField(blank=True, null=True)
    etat_surface = models.TextField(blank=True, null=True)
    couvert_vegetal = models.TextField(blank=True, null=True)
    test_beche = models.TextField(blank=True, null=True)
    # autres champs selon la fiche papier...
    def save(self, *args, **kwargs):
        if not self.EAP:
            ville_code = (self.ville or "").upper().replace("'", "").replace(" ", "-")[:10]
            # Compte le nombre de fiches existantes pour la ville
            count = FicheAgroPedodeSol.objects.filter(ville=self.ville).count() + 1
            self.EAP = f"EAP-25-{ville_code}-{count:03d}"
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.nom_sondage} ({self.EAP})".upper()

    class Meta:
        db_table = 'fiche_agropedodesol'
        verbose_name = "Fiche agro-pédologique de sol"
        verbose_name_plural = "Fiches agro-pédologiques de sol"
        ordering = ['-date', 'nom_sondage']

class FicheHorizon(models.Model):
    fiche = models.ForeignKey('FicheAgroPedodeSol', on_delete=models.CASCADE, related_name='horizons')
    nom = models.CharField(max_length=10)  # H1, H2, H3... (obligatoire)
    profondeur = models.CharField(max_length=20, blank=True, null=True)
    texture = models.CharField(max_length=50, blank=True, null=True)
    humidite = models.CharField(max_length=50, blank=True, null=True)
    couleur = models.CharField(max_length=50, blank=True, null=True)
    hydromorphie = models.CharField(max_length=50, blank=True, null=True)
    test_hcl = models.CharField(max_length=50, blank=True, null=True)
    porosite = models.CharField(max_length=100, blank=True, null=True)
    compacite = models.CharField(max_length=100, blank=True, null=True)
    activite_bio = models.CharField(max_length=100, blank=True, null=True)
    commentaires = models.TextField(blank=True, null=True)
    representation_profil = models.CharField(max_length=100, blank=True, null=True)
    echantillon = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.fiche.nom_sondage} - {self.nom}"

    class Meta:
        db_table = 'fiche_horizon'
        verbose_name = "Horizon de fiche agro-pédologique"
        verbose_name_plural = "Horizons de fiche agro-pédologique"
        ordering = ['fiche', 'nom']

class FichePhoto(models.Model):
    horizon = models.ForeignKey('FicheHorizon', on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='photos_fichesagropedosol')
    description = models.CharField(max_length=100, blank=True, null=True)


  
    def __str__(self):
        return f"Photo {self.horizon.fiche.nom_sondage} - {self.horizon.nom}"

    class Meta:
        db_table = 'fiche_photo'
        verbose_name = "Photo de fiche horizon"
        verbose_name_plural = "Photos de fiche horizon"
        ordering = ['horizon', 'id']


# Table intermédiaire pour les mélanges de gisements
class MelangeIngredient(models.Model):
    """Table intermédiaire: 1 ligne = 1 composant de la recette."""
    melange = models.ForeignKey("Melange", on_delete=models.CASCADE, related_name="ingredients")
    gisement = models.ForeignKey(Gisement, on_delete=models.CASCADE)
    pourcentage = models.DecimalField(max_digits=5, decimal_places=2)
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='melange_ingredients', help_text="Responsable automatiquement défini à l'utilisateur connecté.")

    class Meta:
        db_table = 'melange_ingredient'
        verbose_name = "Ingrédient de mélange"
        verbose_name_plural = "Ingrédients de mélange"
        ordering = ['melange', 'gisement']
        unique_together = [("melange", "gisement")] # Un gisement ne peut être dans un mélange qu'une seule fois
    def __str__(self):
        return f"{self.gisement.nom} dans {self.melange.reference_produit} ({self.pourcentage}%)"
    
class MelangeAmendement(models.Model):
    melange = models.ForeignKey("Melange", on_delete=models.CASCADE, related_name="amendements")
    utlisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='melange_amendements', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    amendementOrganique = models.ForeignKey("AmendementOrganique", on_delete=models.CASCADE)
    pourcentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Pourcentage de l'émendent organique dans le mélange. Si vide, il est calculé automatiquement.")
    class Meta:
        db_table = 'melange_emendement'
        verbose_name = "Amendement de mélange"
        verbose_name_plural = "Amendements de mélange"
        ordering = ['melange', 'amendementOrganique']
        unique_together = [("melange", "amendementOrganique")]

        def __str__(self):
            return f"{self.amendementOrganique.nom} dans {self.melange.reference_produit} ({self.pourcentage}%)"


class AmendementOrganique(models.Model):


    nom = models.CharField(max_length=255, unique=True, default="", help_text="Nom de l'émendent organique, généré automatiquement si vide.", editable=False)
    numero_sequence = models.IntegerField(default=1, help_text="Numéro séquentiel pour le tri", editable=False)
    plateforme = models.ForeignKey('Plateforme', on_delete=models.CASCADE, null=True, blank=True, related_name='emendements', help_text="Plateforme de compostage ou d'émendement associée.")
    fournisseur = models.CharField(max_length=255, help_text="Fournisseur de l'émendent organique")
    date_reception = models.DateField(default=timezone.now)
    commune = models.CharField(max_length=100, help_text="Commune de provenance de l'émendent organique", default="LYON")
    date_semis = models.DateField(default=timezone.now, help_text="Date de semis de l'émendent organique")
    volume_disponible = models.DecimalField(max_digits=10, decimal_places=2, help_text="Volume disponible de l'émendent organique")
    localisation = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='emendements', help_text="Responsable automatiquement défini à l'utilisateur connecté.")

    def save(self, *args, **kwargs):
        pattern = r"^MAO-\d{2}-[A-Z0-9]{2,6}-[A-Z0-9]{2,6}-\d{3}$"
        
        # Normalisation
        if self.fournisseur:
            self.fournisseur = self.fournisseur.upper()
        if self.commune:
            self.commune = self.commune.upper()

        regenerer = False

        if not self.pk:
            # ➡️ Cas CREATION
            regenerer = True
        else:
            # ➡️ Cas MODIFICATION - Vérifier si les champs clés ont changé
            if not re.match(pattern, self.nom or ""):
                regenerer = True
            else:
                # Récupérer l'instance originale pour comparer les changements
                try:
                    original = AmendementOrganique.objects.get(pk=self.pk)
                    
                    # Vérifier si les champs utilisés pour générer le nom ont changé
                    annee_actuelle = str(self.date_reception.year if self.date_reception else date.today().year)[-2:]
                    annee_originale = str(original.date_reception.year if original.date_reception else date.today().year)[-2:]
                    
                    fournisseur_code_actuel = re.sub(r'[^A-Z0-9]', '', slugify(self.fournisseur).upper())[:3] if self.fournisseur else "XXX"
                    fournisseur_code_original = re.sub(r'[^A-Z0-9]', '', slugify(original.fournisseur).upper())[:3] if original.fournisseur else "XXX"
                    
                    commune_code_actuel = re.sub(r'[^A-Z0-9]', '', self.commune or "")[:3]
                    commune_code_original = re.sub(r'[^A-Z0-9]', '', original.commune or "")[:3]
                    
                    # Si l'un des composants du nom a changé, régénérer
                    if (annee_actuelle != annee_originale or 
                        fournisseur_code_actuel != fournisseur_code_original or 
                        commune_code_actuel != commune_code_original):
                        regenerer = True
                        
                except AmendementOrganique.DoesNotExist:
                    regenerer = True
                
                # Si nom déjà utilisé par un autre amendement → régénérer
                if AmendementOrganique.objects.exclude(pk=self.pk).filter(nom=self.nom).exists():
                    regenerer = True

        if regenerer:
            with transaction.atomic():  # sécurité multi-utilisateurs pour éviter les doublons
                if self.pk:
                    # Pour une modification, conserver le numéro séquentiel existant
                    self.nom = self._generate_nom_with_existing_suffix()
                else:
                    # Pour une création, générer un nouveau numéro
                    self.nom = self._generate_nom(reindex=True)

        super().save(*args, **kwargs)

    def _generate_nom(self, reindex=False):
        """Génère un nom unique pour la plateforme et réindexe tous les suffixes si demandé"""
        # Prendre les 2 derniers chiffres de l'année
        annee = str(self.date_reception.year if self.date_reception else date.today().year)[-2:]

        # Code fournisseur : 3 premiers caractères
        fournisseur_code = re.sub(r'[^A-Z0-9]', '', slugify(self.fournisseur).upper())[:3] if self.fournisseur else "XXX"

        # Code commune : 3 premiers caractères
        commune_code = re.sub(r'[^A-Z0-9]', '', self.commune or "")[:3]

        base_nom_prefix = f"MAO-{annee}-{fournisseur_code}-{commune_code}"

        # Récupère tous les amendements de la MÊME PLATEFORME, triés par numéro de séquence
        existing_amendements = list(
            AmendementOrganique.objects.exclude(pk=self.pk)
            .filter(plateforme=self.plateforme)
            .order_by('numero_sequence')
        )

        # Réindexe tous les suffixes existants pour cette plateforme
        if reindex and existing_amendements:
            for index, amendement in enumerate(existing_amendements, start=1):
                match = re.match(r"(MAO-\d{2}-[A-Z0-9]{2,6}-[A-Z0-9]{2,6})-\d{3}", amendement.nom)
                if match:
                    new_nom = f"{match.group(1)}-{index:03d}"
                    if amendement.nom != new_nom:
                        amendement.nom = new_nom
                        amendement.numero_sequence = index
                        amendement.save(update_fields=['nom', 'numero_sequence'])

        # Nouveau suffixe = nombre d'amendements existants dans cette plateforme + 1
        suffix = len(existing_amendements) + 1
        self.numero_sequence = suffix
        unique_nom = f"{base_nom_prefix}-{suffix:03d}"
        return unique_nom

    def _generate_nom_with_existing_suffix(self):
        """Génère un nom en conservant le numéro séquentiel existant lors d'une modification"""
        # Extraire le suffixe existant du nom actuel
        current_suffix = "001"  # valeur par défaut
        current_sequence = 1
        if self.nom:
            match = re.search(r"-(\d{3})$", self.nom)
            if match:
                current_suffix = match.group(1)
                current_sequence = int(match.group(1))
        
        # Conserver le numéro de séquence existant
        self.numero_sequence = current_sequence
        
        # Prendre les 2 derniers chiffres de l'année
        annee = str(self.date_reception.year if self.date_reception else date.today().year)[-2:]

        # Code fournisseur : 3 premiers caractères
        fournisseur_code = re.sub(r'[^A-Z0-9]', '', slugify(self.fournisseur).upper())[:3] if self.fournisseur else "XXX"

        # Code commune : 3 premiers caractères
        commune_code = re.sub(r'[^A-Z0-9]', '', self.commune or "")[:3]

        # Générer le nouveau nom avec l'ancien suffixe
        new_nom = f"MAO-{annee}-{fournisseur_code}-{commune_code}-{current_suffix}"
        
        # Vérifier que ce nouveau nom n'existe pas déjà (avec un autre amendement)
        if AmendementOrganique.objects.exclude(pk=self.pk).filter(nom=new_nom).exists():
            # Si conflit, utiliser la méthode normale pour générer un nouveau suffixe
            return self._generate_nom(reindex=True)
        
        return new_nom

    class Meta:
        db_table = 'AmendementOrganique'
        verbose_name = "Amendement organique"
        verbose_name_plural = "Amendements organiques"
        ordering = ['plateforme', 'numero_sequence']

    def __str__(self):
        return f"Amendement organique - {self.nom} ({self.fournisseur})"




class Plateforme(models.Model):
    nom = models.CharField(max_length=255, null=True, blank=True, help_text="Nom de la plateforme, généré automatiquement si vide.", editable=False, unique=True)
    numero_sequence = models.IntegerField(default=1, help_text="Numéro séquentiel pour le tri", editable=False)
    localisation = models.CharField(max_length=255)
    entreprise_gestionnaire = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='plateformes',help_text="Responsable automatiquement défini à l'utilisateur connecté."
)
    date_creation = models.DateField(default=timezone.now,)  # Date de création de la plateforme
    
    def save(self, *args, **kwargs):
        pattern = r"^PTF-[A-Z0-9]{2,6}-[A-Z0-9]{2,6}-\d{3}$"
        
        # Normalisation
        if self.localisation:
            self.localisation = self.localisation.upper()
        if self.entreprise_gestionnaire:
            self.entreprise_gestionnaire = self.entreprise_gestionnaire.upper()

        regenerer = False

        if not self.pk:
            # ➡️ Cas CREATION
            regenerer = True
        else:
            # ➡️ Cas MODIFICATION - Vérifier si les champs clés ont changé
            if not re.match(pattern, self.nom or ""):
                regenerer = True
            else:
                # Récupérer l'instance originale pour comparer les changements
                try:
                    original = Plateforme.objects.get(pk=self.pk)
                    
                    # Vérifier si les champs utilisés pour générer le nom ont changé
                    annee_actuelle = str(self.date_creation.year if self.date_creation else date.today().year)[-2:]
                    annee_originale = str(original.date_creation.year if original.date_creation else date.today().year)[-2:]
                    
                    ent_actuelle = str(self.entreprise_gestionnaire).strip().upper()[:3]
                    ent_originale = str(original.entreprise_gestionnaire).strip().upper()[:3]
                    
                    loc_actuelle = str(self.localisation).strip().upper()[:3]
                    loc_originale = str(original.localisation).strip().upper()[:3]
                    
                    # Si l'un des composants du nom a changé, régénérer
                    if (annee_actuelle != annee_originale or 
                        ent_actuelle != ent_originale or 
                        loc_actuelle != loc_originale):
                        regenerer = True
                        
                except Plateforme.DoesNotExist:
                    regenerer = True
                
                # Si nom déjà utilisé par une autre plateforme → régénérer
                if Plateforme.objects.exclude(pk=self.pk).filter(nom=self.nom).exists():
                    regenerer = True

        if regenerer:
            with transaction.atomic():  # sécurité multi-utilisateurs pour éviter les doublons
                if self.pk:
                    # Pour une modification, conserver le numéro séquentiel existant
                    self.nom = self._generate_nom_with_existing_suffix()
                else:
                    # Pour une création, générer un nouveau numéro
                    self.nom = self._generate_nom(reindex=True)

        super().save(*args, **kwargs)

    def _generate_nom(self, reindex=False):
        """Génère un nom unique pour l'année et réindexe tous les suffixes si demandé"""
        # Prendre les 2 derniers chiffres de l'année
        annee = str(self.date_creation.year if self.date_creation else date.today().year)[-2:]

        # Code entreprise : 3 premiers caractères
        ent_code = str(self.entreprise_gestionnaire).strip().upper()[:3]

        # Code localisation : 3 premiers caractères
        loc_code = str(self.localisation).strip().upper()[:3]

        base_nom_prefix = f"PTF-{annee}-{ent_code}-{loc_code}"

        # Récupère toutes les plateformes de l'année, triées par numéro de séquence
        existing_plateformes = list(
            Plateforme.objects.exclude(pk=self.pk)
            .filter(nom__startswith=f"PTF-{annee}-")
            .order_by('numero_sequence')
        )

        # Réindexe tous les suffixes existants
        if reindex and existing_plateformes:
            for index, plateforme in enumerate(existing_plateformes, start=1):
                match = re.match(r"(PTF-\d{2}-[A-Z0-9]{2,6}-[A-Z0-9]{2,6})-\d{3}", plateforme.nom)
                if match:
                    new_nom = f"{match.group(1)}-{index:03d}"
                    if plateforme.nom != new_nom:
                        plateforme.nom = new_nom
                        plateforme.numero_sequence = index
                        plateforme.save(update_fields=['nom', 'numero_sequence'])

        # Nouveau suffixe = nombre de plateformes existantes + 1
        suffix = len(existing_plateformes) + 1
        self.numero_sequence = suffix
        unique_nom = f"{base_nom_prefix}-{suffix:03d}"
        return unique_nom

    def _generate_nom_with_existing_suffix(self):
        """Génère un nom en conservant le numéro séquentiel existant lors d'une modification"""
        # Extraire le suffixe existant du nom actuel
        current_suffix = "001"  # valeur par défaut
        current_sequence = 1
        if self.nom:
            match = re.search(r"-(\d{3})$", self.nom)
            if match:
                current_suffix = match.group(1)
                current_sequence = int(match.group(1))
        
        # Conserver le numéro de séquence existant
        self.numero_sequence = current_sequence
        
        # Prendre les 2 derniers chiffres de l'année
        annee = str(self.date_creation.year if self.date_creation else date.today().year)[-2:]

        # Code entreprise : 3 premiers caractères
        ent_code = str(self.entreprise_gestionnaire).strip().upper()[:3]

        # Code localisation : 3 premiers caractères
        loc_code = str(self.localisation).strip().upper()[:3]

        # Générer le nouveau nom avec l'ancien suffixe
        new_nom = f"PTF-{annee}-{ent_code}-{loc_code}-{current_suffix}"
        
        # Vérifier que ce nouveau nom n'existe pas déjà (avec une autre plateforme)
        if Plateforme.objects.exclude(pk=self.pk).filter(nom=new_nom).exists():
            # Si conflit, utiliser la méthode normale pour générer un nouveau suffixe
            return self._generate_nom(reindex=True)
        
        return new_nom

    def __str__(self):
        return f"Plateforme - {self.nom or 'Sans nom'}"
   
    class Meta:
        db_table = 'plateforme'
        verbose_name = "Plateforme"
        verbose_name_plural = "Plateformes"
        ordering = ['numero_sequence']



class Melange(models.Model):
    class Etat(models.IntegerChoices):
        COMPOSITION = 1, "Composition"
        CONFORMITE = 2, "Ordre de conformité"
        CONSIGNE = 3, "Consignes de mélange"
        CONTROLE_1 = 4, "Contrôle +1 mois"
        CONTROLE_2 = 5, "Contrôle +2 mois"
        VALIDATION = 6, "Validation finale (Fiche technique)"
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='melanges', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    nom = models.CharField("Nom du mélange", max_length=255, null=True, blank=True)
    gisements = models.ManyToManyField('Gisement', through='MelangeIngredient', related_name='melanges')
    date_creation = models.DateField(default=today)
    date_semis = models.DateField(default=today
    )
    reference_produit = models.CharField(max_length=100, unique=True, editable=False)
    plateforme = models.ForeignKey('Plateforme', on_delete=models.CASCADE, null=True, blank=True)
    fournisseur = models.CharField(max_length=255)
    commune = models.CharField(max_length=100, default='', help_text="Commune du mélange")
  

    couverture_vegetale = models.CharField(max_length=100, null=True, blank=True)
    periode_melange = models.CharField(max_length=100)
    references_analyses = models.TextField(null=True, blank=True)

    etat = models.IntegerField(choices=Etat.choices, default=Etat.COMPOSITION)
    ordre_conformite = models.FileField(upload_to='documents/ordres_conformite/', null=True, blank=True)
    consignes_melange = models.FileField(upload_to='documents/consignes_melange/', null=True, blank=True)
    controle_1 = models.FileField(upload_to='documents/controle_1/', null=True, blank=True)
    controle_2 = models.FileField(upload_to='documents/controle_2/', null=True, blank=True)
    fiche_technique = models.FileField(upload_to='documents/fiche_technique/', null=True, blank=True)



    def save(self, *args, **kwargs):
        regenerer = False
        
        if not self.pk:
            # Création
            regenerer = True
        else:
            # Modification : vérifier si les champs clés ont changé
            if not self.nom:
                regenerer = True
            else:
                # Récupérer l'instance originale pour comparer les changements
                try:
                    original = Melange.objects.get(pk=self.pk)
                    
                    # Vérifier si les champs utilisés pour générer le nom ont changé
                    annee_actuelle = self.date_creation.year % 100
                    annee_originale = original.date_creation.year % 100
                    
                    fournisseur_code_actuel = (self.fournisseur or self.producteur)[:3].upper()
                    fournisseur_code_original = (original.fournisseur or original.producteur)[:3].upper()
                    
                    plateforme_code_actuel = self.plateforme.nom[:3].upper() if self.plateforme else "XXX"
                    plateforme_code_original = original.plateforme.nom[:3].upper() if original.plateforme else "XXX"
                    
                    # Si l'un des composants du nom a changé, régénérer
                    if (annee_actuelle != annee_originale or 
                        fournisseur_code_actuel != fournisseur_code_original or 
                        plateforme_code_actuel != plateforme_code_original):
                        regenerer = True
                        
                except Melange.DoesNotExist:
                    regenerer = True
        
        if regenerer:
            with transaction.atomic():
                if self.pk:
                    # Pour une modification, conserver le numéro séquentiel existant
                    self.nom, self.reference_produit = self._generate_nom_with_existing_suffix()
                else:
                    # Pour une création, générer un nouveau numéro
                    self.nom, self.reference_produit = self._generate_nom_new()
        
        super().save(*args, **kwargs)


    def _generate_nom_new(self):
        """Génère un nouveau nom pour un mélange"""
        prefix = "MEL"
        annee = self.date_creation.year % 100
        fournisseur_code = (self.fournisseur or "XXX")[:3].upper()
        commune_code = (self.commune or "XXX")[:3].upper()
        
        # Base du nom pour la plateforme et l'année seulement (incrément global pour la plateforme)
        base_nom = f"{prefix}-{annee}-"
        
        # Récupérer tous les mélanges existants pour la même plateforme et année
        existing = Melange.objects.filter(
            nom__startswith=base_nom,
            plateforme=self.plateforme
        ).values_list('nom', flat=True)
        nums = []
        for n in existing:
            match = re.search(r'M(\d+)$', n)
            if match:
                nums.append(int(match.group(1)))
        next_num = max(nums) + 1 if nums else 1
        numero_str = f"M{next_num:02d}"
        
        # Nom final incluant fournisseur pour lecture claire
        nom = f"{prefix}-{annee}-{fournisseur_code}-{commune_code}-{numero_str}"
        return nom, nom
    
    def _generate_nom_with_existing_suffix(self):
        """Génère un nom en conservant le numéro séquentiel existant lors d'une modification"""
        # Extraire le suffixe existant du nom actuel
        current_suffix = "M01"  # valeur par défaut
        if self.nom:
            match = re.search(r"-(M\d+)$", self.nom)
            if match:
                current_suffix = match.group(1)
        
        prefix = "MEL"
        annee = self.date_creation.year % 100
        fournisseur_code = (self.fournisseur or "XXX")[:3].upper()
        commune_code = (self.commune or "XXX")[:3].upper()
        
        # Générer le nouveau nom avec l'ancien suffixe
        new_nom = f"{prefix}-{annee}-{fournisseur_code}-{commune_code}-{current_suffix}"
        
        # Vérifier que ce nouveau nom n'existe pas déjà (avec un autre mélange)
        if Melange.objects.exclude(pk=self.pk).filter(nom=new_nom).exists():
            # Si conflit, utiliser la méthode normale pour générer un nouveau suffixe
            return self._generate_nom_new()
        
        return new_nom, new_nom

    def __str__(self):
        return f"Mélange {self.nom}"

    def tache_actuelle(self):
        return {
            self.Etat.COMPOSITION: "Veuillez composer le mélange avec les gisements.",
            self.Etat.CONFORMITE: "Veuillez renseigner un ordre de conformité.",
            self.Etat.CONSIGNE: "Veuillez fournir les consignes de mélange.",
            self.Etat.CONTROLE_1: "Un contrôle de réduction +1 mois est requis.",
            self.Etat.CONTROLE_2: "Un contrôle +2 mois est requis.",
            self.Etat.VALIDATION: "Fiche technique obligatoire.",
        }.get(self.etat, None)

    def delete(self, *args, **kwargs):
        # Supprime tous les fichiers liés s'ils existent
        for field in ['ordre_conformite', 'consignes_melange', 'controle_1', 'controle_2', 'fiche_technique']:
            file_field = getattr(self, field)
            if file_field and file_field.name:
                file_field.delete(save=False)
        super().delete(*args, **kwargs)

    class Meta:
        db_table = 'melange'
        verbose_name = "Mélange"
        verbose_name_plural = "Mélanges"
        ordering = ['-periode_melange']

"""
Modele pour les produits de vente dérivés des mélanges
"""
class ProduitVente(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='produits_vente',  # unique
        help_text="Responsable automatiquement défini à l'utilisateur connecté."
    )
    reference_produit = models.CharField(max_length=100, unique=True, editable=False)
    melange = models.OneToOneField(
        Melange,
        on_delete=models.CASCADE,
        related_name='produit_vente'
    )
    fournisseur = models.CharField(max_length=255)
    nom_site = models.CharField(max_length=255,null=True, blank=True)  
    volume_initial = models.DecimalField(max_digits=10, decimal_places=2)  
    volume_disponible = models.DecimalField(max_digits=10, decimal_places=2)
    date_disponibilite = models.DateField(default=today)
    commentaires_analyses = models.TextField(null=True,blank=True)
    volume_vendu = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    acheteur = models.CharField(max_length=255, blank=True, null=True)
    date_achat = models.DateField(blank=True, null=True)
    periode_destockage = models.CharField(max_length=255, blank=True)
    localisation_projet = models.CharField(max_length=255, blank=True)
    date_creation = models.DateField(auto_now_add=True)
    pret_pour_vente = models.BooleanField(default=False)


    @property
    def volume_disponible(self):
        volume_initial = self.volume_initial or Decimal(0)
        volume_vendu = self.volume_vendu or Decimal(0)
        return volume_initial - volume_vendu


    def __str__(self):
        try:
            if self.reference_produit and self.melange:
                return f"Produit {self.reference_produit} - {self.melange.nom} ({self.fournisseur})"
            elif self.reference_produit:
                return f"Produit {self.reference_produit} ({self.fournisseur})"
            else:
                return f"Produit de vente - {self.fournisseur}"
        except:
            return f"Produit de vente #{self.id}"
    
    def save(self, *args, **kwargs):
        # Générer une référence produit unique à partir du nom du mélange
        if not self.reference_produit and self.melange_id:
            try:
                melange = Melange.objects.get(id=self.melange_id)
                # Exemple attendu pour melange.nom : MEL-25-PHV-BRO-M01
                parts = (melange.nom or '').split('-')
                if len(parts) >= 5:
                    # Base sans suffixe séquentiel
                    base_prefix = f"PRD-{parts[1]}-{parts[2]}-{parts[3]}-"
                else:
                    # Fallback: remplacer MEL->PRD et enlever le dernier segment
                    prefix = (melange.nom or '').replace('MEL', 'PRD')
                    base_prefix = prefix.rsplit('-', 1)[0] + '-'

                # Chercher les références existantes qui partagent ce préfixe
                existing = (
                    ProduitVente
                    .objects
                    .filter(reference_produit__startswith=base_prefix)
                    .values_list('reference_produit', flat=True)
                )

                # Extraire le suffixe numérique à 3 chiffres et trouver le max
                max_num = 0
                for ref in existing:
                    try:
                        suffix = ref.split('-')[-1]
                        num = int(suffix)
                        if num > max_num:
                            max_num = num
                    except Exception:
                        continue

                next_num = max_num + 1 if max_num > 0 else 1
                self.reference_produit = f"{base_prefix}{next_num:03d}"
            except Melange.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'produit_vente'
        verbose_name = "Produit de vente"
        verbose_name_plural = "Produits de vente"
        ordering = ['-date_creation']


class DocumentProduitVente(models.Model):
    produit = models.ForeignKey(ProduitVente, on_delete=models.CASCADE, related_name="doc_produit_vente")
  
    type_document = models.CharField(
        max_length=50,
        choices=[
            ('FTP', 'Fiche technique produit'),
            ('ANALYSE', 'Analyse'),
            ('SUIVI', 'Suivi visuel'),
            ('AUTRE', 'Autre document de traçabilité')
        ]
    )
    fichier = models.FileField(upload_to='documents_produits/')
    remarque = models.TextField(blank=True, null=True)
    date_ajout = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f"{self.get_type_document_display()} - {self.produit.reference_produit}"



class DocumentTechnique(models.Model):
    produit = models.ForeignKey(ProduitVente, on_delete=models.CASCADE, related_name="documents")
    nom_fichier = models.CharField(max_length=255)
    fichier = models.FileField(upload_to='documents/')
    type_document = models.CharField(max_length=100, choices=[
        ('fiche_produit', 'Fiche produit'),
        ('radar', 'Radar produit'),
        ('analyse', 'Analyse laboratoire'),
        ('description_sol', 'Fiche description sol'),
        ('protocole', 'Protocole d’échantillonnage'),
        ('autre', 'Autre'),
    ])
    date_ajout = models.DateField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        if self.fichier:
            self.fichier.delete(save=False)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.type_document} pour {self.produit.reference_produit}"

    class Meta:
        db_table = 'document_technique'
        verbose_name = "Document technique"
        verbose_name_plural = "Documents techniques"
        ordering = ['-date_ajout']

# Document lié à un gisement
class DocumentGisement(models.Model):
    TYPE_CHOICES = [
        ('photo', 'Photo'),
        ('geotechnique', 'Analyse géotechnique'),
        ('pollution', 'Analyse pollution'),
        ('agronomique', 'Analyse agronomique'),
        ('autre', 'Autre document'),
    ]
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents_gisements', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    gisement = models.ForeignKey(Gisement, on_delete=models.CASCADE, related_name='documents')
    type_document = models.CharField(max_length=50, choices=TYPE_CHOICES, default='autre',blank=True, null=True)
    fichier = models.FileField(upload_to='documents_gisements/',blank=True, null=True)
    nom_fichier = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.type_document and self.fichier and not self.nom_fichier:
            # Exemple : "Photo - image1.jpg"
            type_label = dict(self.TYPE_CHOICES).get(self.type_document, 'Document')
            nom_physique = self.fichier.name.split('/')[-1]
            self.nom_fichier = f"{type_label} - {self.gisement.nom}-{nom_physique}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Document {self.type_document} pour {self.gisement.nom}"
    class Meta:
        db_table = 'document_gisement'
        verbose_name = "Document de gisement"
        verbose_name_plural = "Documents de gisement"
        ordering = ['-date_ajout']


class AnalyseLaboratoire(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='analyses_laboratoire', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    produit = models.ForeignKey(ProduitVente, on_delete=models.CASCADE, related_name='analyses')
    laboratoire = models.CharField(max_length=255)
    code_rapport = models.CharField(max_length=100)
    date_reception = models.DateField()
    date_analyse = models.DateField()
    profondeur_prelevement = models.CharField(max_length=100, null=True, blank=True)
    localisation_echantillon = models.CharField(max_length=255, null=True, blank=True)

    ph_eau = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    ph_kcl = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    calcaire_total = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    calcaire_actif = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    conductivite = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    matiere_organique = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    azote_total = models.DecimalField(max_digits=5, decimal_places=3, null=True, blank=True)
    c_n = models.DecimalField("Rapport C/N", max_digits=5, decimal_places=2, null=True, blank=True)

    cec = models.DecimalField("CEC (meq/100g)", max_digits=6, decimal_places=2, null=True, blank=True)
    saturation = models.DecimalField("Taux de saturation (%)", max_digits=5, decimal_places=2, null=True, blank=True)

    argile = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    limons_fins = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    limons_grossiers = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    sables_fins = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    sables_grossiers = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    calcium = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    magnesium = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    potassium = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    phosphore = models.DecimalField("P2O5 (mg/kg)", max_digits=6, decimal_places=2, null=True, blank=True)
    fer = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    cuivre = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    zinc = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    manganese = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    densite_apparente = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    porosite_totale = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    porosite_drainage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    eau_capillaire = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    permeabilite = models.DecimalField("Perméabilité (cm/h)", max_digits=6, decimal_places=2, null=True, blank=True)

    iam = models.DecimalField("Intensité activité microbienne", max_digits=5, decimal_places=2, null=True, blank=True)
    refus_gravier_2mm = models.DecimalField("Refus gravier (>2mm, %)", max_digits=5, decimal_places=2, null=True, blank=True)
    fichier_pdf = models.FileField(upload_to='uploads/analyse_pdfs/', null=True, blank=True)


    commentaires = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Analyse du {self.date_analyse} - {self.laboratoire}"

    class Meta:
        db_table = 'analyse_laboratoire'
        verbose_name = "Analyse de laboratoire"
        verbose_name_plural = "Analyses de laboratoire"
        ordering = ['-date_analyse']


class SaisieVente(models.Model):
    responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='saisies_ventes',
        help_text="Responsable automatiquement défini à l'utilisateur connecté."
    )
    produit = models.ForeignKey(
        ProduitVente,
        on_delete=models.CASCADE,
        related_name='ventes'
    )
    nom_client = models.CharField(max_length=255)
    volume_tonne = models.DecimalField(max_digits=10, decimal_places=2)
    date_vente = models.DateField()

    nom_chantier_recepteur = models.CharField(max_length=255)
    adresse_chantier = models.CharField(max_length=255)

    chantier = models.ForeignKey(
        'ChantierRecepteur',
        on_delete=models.SET_NULL,
        null=True, blank=True
    )
    est_validee = models.BooleanField(
        default=False,
        help_text="Indique si la vente a été validée par l'entreprise"
    )

    date_achat = models.DateTimeField(auto_now_add=True)
    date_modification_vente = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Génération automatique du nom à partir de la référence produit du ProduitVente lié
        if not hasattr(self, 'nom') or not self.nom:
            if self.produit and hasattr(self.produit, 'reference_produit') and self.produit.reference_produit:
                self.nom = self.produit.reference_produit
        if self.adresse_chantier:
            chantier, created = ChantierRecepteur.objects.get_or_create(
                adresse=self.adresse_chantier,
                defaults={'nom': self.nom_chantier_recepteur}
            )
            self.chantier = chantier
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.produit.reference_produit} - {'Validée' if self.est_validee else 'En attente'}"

    class Meta:
        db_table = 'saisie_vente'
        verbose_name = "Saisie de vente"
        verbose_name_plural = "Saisies de vente"
        ordering = ['-date_achat', 'nom_client']



class ChantierRecepteur(models.Model):
    nom = models.CharField(max_length=255)
    adresse = models.CharField(max_length=255, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} - {self.adresse}"
    class Meta:
        db_table = 'chantier_recepteur'
        verbose_name = "Chantier récepteur"
        verbose_name_plural = "Chantiers récepteurs"
        ordering = ['nom']



class Planning(models.Model):
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='plannings', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    melange = models.ForeignKey("Melange", on_delete=models.CASCADE, related_name="plannings")
    titre = models.CharField(max_length=255)
    date_debut = models.DateField()
    duree_jours = models.IntegerField(default=1)
    statut = models.CharField(max_length=50, choices=[
        ("done", "Terminé"),
        ("active", "En cours"),
        ("planned", "Planifié")
    ])

    def __str__(self):
        return f"{self.titre} ({self.melange})"