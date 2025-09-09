from decimal import Decimal
import uuid
from django.forms import ValidationError
from django.utils.text import slugify
from datetime import date, datetime
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

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
    nom = models.CharField("Nom du chantier", max_length=255)
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='chantiers', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    maitre_ouvrage = models.CharField(max_length=255)
    entreprise_terrassement = models.CharField(max_length=255)
    date_creation = models.DateField(default=today)
    is_active = models.BooleanField(default=True) 
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.nom}"

    class Meta:
        db_table = 'chantier'
        verbose_name = "Chantier"
        verbose_name_plural = "Chantiers"
        ordering = ['nom']


class Gisement(models.Model):
    TYPE_SOL_CHOICES = [
        ('limon', 'Limon'),
        ('argile', 'Argile'),
        ('terre', 'Terre'),
        ('gravier', 'Gravier'),
        ('sableux', 'Sableux'),
        ('argileux', 'Argileux'),
        ('caillouteux', 'Caillouteux'),
        ('autre', 'Autre'),
    ]
   
    from django.utils import timezone
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='gisements', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    nom = models.CharField(max_length=255, null=True, blank=True, help_text="Nom du gisement, généré automatiquement si vide.", editable=False,unique=True)
    date_creation = models.DateField(default=today, help_text="Date de création du gisement")
    chantier = models.ForeignKey(Chantier, on_delete=models.CASCADE, related_name='gisements')
    commune = models.CharField(max_length=100)
    periode_terrassement = models.CharField(max_length=100) 
    volume_terrasse = models.DecimalField(max_digits=10, decimal_places=2)
    materiau = models.CharField(max_length=255) # Type de matériau ()
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    type_de_sol = models.CharField(max_length=20, choices=TYPE_SOL_CHOICES, default='limon')

    def save(self, *args, **kwargs):
        if self.date_creation and self.chantier:
            annee = self.date_creation.year
            base_nom = f"GIS-{annee}-{slugify(self.chantier.nom).replace('-', '_').upper()}"
            unique_nom = base_nom
            suffix = 1

            while Gisement.objects.exclude(pk=self.pk).filter(nom=unique_nom).exists():
                suffix += 1
                unique_nom = f"{base_nom}-{suffix}"

            self.nom = unique_nom

        super().save(*args, **kwargs)


    def __str__(self):
        return f"Gisement - {self.nom}"

    
    class Meta:
        db_table = 'gisement'
        verbose_name = "Gisement"
        verbose_name_plural = "Gisements"
        ordering = ['-periode_terrassement']

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
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='amendements_organique', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    nom = models.CharField(max_length=255, unique=True, help_text="Nom de l'émendent organique, par exemple 'Fumier de cheval'")
    fournisseur = models.CharField(max_length=255, help_text="Fournisseur de l'émendent organique")
    date_reception = models.DateField(default=timezone.now)
    date_semis = models.DateField(default=timezone.now, help_text="Date de semis de l'émendent organique")
    plateforme = models.ForeignKey('Plateforme', on_delete=models.CASCADE, null=True, blank=True, related_name='emendements', help_text="Plateforme de compostage ou d'émendement associée.")
    volume_disponible = models.DecimalField(max_digits=10, decimal_places=2, help_text="Volume disponible de l'émendent organique")
    localisation = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='emendements', help_text="Responsable automatiquement défini à l'utilisateur connecté.")
    class Meta:
        db_table = 'AmendementOrganique'
        verbose_name = "Émendent organique"
        verbose_name_plural = "Émendements organiques"
        ordering = ['nom']
    
    def __str__(self):
        return f"Émendent organique - {self.nom} ({self.fournisseur})"

class Plateforme(models.Model):
    nom = models.CharField(max_length=255, null=True, blank=True, help_text="Nom de la plateforme, par exemple 'Plateforme de compostage de Paris'")
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='plateformes',help_text="Responsable automatiquement défini à l'utilisateur connecté."
)
    date_creation = models.DateField(default=timezone.now,)  # Date de création de la plateforme

    def __str__(self):
        return f"Plateforme - {self.nom}"
    class Meta:
        db_table = 'plateforme'
        verbose_name = "Plateforme"
        verbose_name_plural = "Plateformes"
        ordering = ['nom']

 



from django.db import models, transaction, IntegrityError
from datetime import date
import re

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
        annee = str(date.today().year)[-2:]

        # Numérotation unique du mélange pour l’année en cours (hors lui-même en cas de modif)
        count = Melange.objects.filter(date_creation__year=date.today().year).exclude(pk=self.pk).count() + 1
        numero = f"M{count:02}"

        # Codes projet et entreprise
        code_projet = "XXX"
        code_entreprise = "ENT"

        # Extraire le code projet depuis le nom (ex: MEL-25-M01-T09-CHZ ou M1-T09-CHAZAL)
        if self.nom:
            match = re.search(r"(?<=-)(T\d{2}|[A-Z]{3})(?=-)", self.nom)
            if match:
                code_projet = match.group(1)[:3].upper()

        # Si projet toujours inconnu → utiliser plateforme ou gisement
        if code_projet == "XXX":
            if self.plateforme and self.plateforme.nom:
                code_projet = re.sub(r'[^A-Z0-9]', '', self.plateforme.nom.upper())[:3]
            elif self.pk and self.gisements.exists():
                commune = self.gisements.first().commune or ''
                code_projet = re.sub(r'[^A-Z]', '', commune.upper())[:3]

        # Code entreprise à partir du fournisseur
        if self.fournisseur:
            code_entreprise = re.sub(r'[^A-Z]', '', self.fournisseur.upper())[:3]

        # Base de la référence produit
        base = f"MEL-{annee}-{numero}-{code_projet}-{code_entreprise}"

        # Si la référence est absente ou incohérente → régénérer
        if not self.reference_produit or not self.reference_produit.startswith(f"MEL-{annee}-{numero}-{code_projet}"):
            for i in range(100):
                tentative = base if i == 0 else f"{base}-{i}"
                if not Melange.objects.filter(reference_produit=tentative).exclude(pk=self.pk).exists():
                    self.reference_produit = tentative
                    break

        # Génération automatique du nom si vide ou par défaut
        if not self.nom or self.nom.lower() in ['melange sans nom', 'mélange sans nom', '']:
            self.nom = self.reference_produit

        # Enregistrement sécurisé avec rollback en cas de duplication
        try:
            with transaction.atomic():
                super().save(*args, **kwargs)
        except IntegrityError:
            self.reference_produit = None
            self.save(*args, **kwargs)

    

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


class ProduitVente(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='produits_vente',  # unique
        help_text="Responsable automatiquement défini à l'utilisateur connecté."
    )
    reference_produit = models.CharField(max_length=100, unique=True)  
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
        return f"Produit {self.reference_produit} - {self.melange.nom} ({self.fournisseur})"
    
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
        if self.adresse_chantier:
            chantier, created = ChantierRecepteur.objects.get_or_create(
                adresse=self.adresse_chantier,
                defaults={'nom': self.nom_chantier_recepteur}
            )
            self.chantier = chantier
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Vente {self.nom_client} - {self.produit.reference_produit} - {'Validée' if self.est_validee else 'En attente'}"

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