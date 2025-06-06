import uuid
from datetime import date, datetime
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

from core.utils import document_upload_path, format_nom_gisement


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
        return f"{self.company_name or self.username} ({self.get_role_display()})"
    class Meta:
        db_table = 'utilisateur'
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['username']


class Chantier(models.Model):
    nom = models.CharField("Nom du chantier", max_length=255)
    maitre_ouvrage = models.CharField(max_length=255)
    entreprise_terrassement = models.CharField(max_length=255)
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Chantier - {self.nom}"

    class Meta:
        db_table = 'chantier'
        verbose_name = "Chantier"
        verbose_name_plural = "Chantiers"
        ordering = ['nom']


class Gisement(models.Model):
    TYPE_SOL_CHOICES = [
        ('limon', 'Limon'),
        ('sableux', 'Sableux'),
        ('argileux', 'Argileux'),
        ('caillouteux', 'Caillouteux'),
        ('autre', 'Autre'),
    ]
    chantier = models.ForeignKey(Chantier, on_delete=models.CASCADE, related_name='gisements')
    commune = models.CharField(max_length=100)
    periode_terrassement = models.CharField(max_length=100) 
    volume_terrasse = models.DecimalField(max_digits=10, decimal_places=2)
    materiau = models.CharField(max_length=255) # Type de matériau ()
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    type_de_sol = models.CharField(max_length=20, choices=TYPE_SOL_CHOICES, default='limon')

    def __str__(self):
        return f"Gisement - {self.commune}"

    
    class Meta:
        db_table = 'gisement'
        verbose_name = "Gisement"
        verbose_name_plural = "Gisements"
        ordering = ['-periode_terrassement']


class Compost(models.Model):
    chantier = models.ForeignKey(Chantier, on_delete=models.CASCADE, related_name='composts')
    fournisseur = models.CharField(max_length=255)
    date_reception = models.DateField()
    volume = models.DecimalField(max_digits=10, decimal_places=2)
    type_compost = models.CharField(max_length=100)
    localisation = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Compost - {self.fournisseur}"

    class Meta:
        db_table = 'compost'
        verbose_name = "Compost"
        verbose_name_plural = "Composts"
        ordering = ['-date_reception']

class Plateforme(models.Model):
    nom = models.CharField("Plateforme sans nom",max_length=100, unique=True)
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
class Melange(models.Model):
    nom = models.CharField("Nom du mélange", max_length=255, null=True, blank=True)
    date_creation = models.DateField(default=timezone.now) # Date de création du mélange
    reference_produit = models.CharField(max_length=100, unique=True, editable=False)
    plateforme = models.ForeignKey(Plateforme, on_delete=models.CASCADE, null=True, blank=True)
    gisements = models.ManyToManyField('Gisement', related_name='melanges')
    fournisseur = models.CharField(max_length=255)
    couverture_vegetale = models.CharField(max_length=100, null=True, blank=True)
    periode_melange = models.CharField(max_length=100)
    date_semis = models.DateField(default=timezone.now)
    references_analyses = models.TextField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_produit:
            prefix = self.plateforme.nom[:4].upper() if self.plateforme and self.plateforme.nom else "XXXX"
            annee = str(date.today().year)
            count = Melange.objects.filter(plateforme=self.plateforme).count() + 1
            self.reference_produit = f"{prefix}-{annee}-MEL-{count:03}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Mélange {self.reference_produit}"

    class Meta:
        db_table = 'melange'
        verbose_name = "Mélange"
        verbose_name_plural = "Mélanges"
        ordering = ['-periode_melange']


class ProduitVente(models.Model):
    reference_produit = models.CharField(max_length=100, unique=True, editable=False)
    melange = models.OneToOneField(Melange, on_delete=models.SET_NULL, null=True, blank=True)
    chantier = models.ForeignKey(Chantier, on_delete=models.SET_NULL, null=True, blank=True)
    fournisseur = models.CharField(max_length=255)
    nom_site = models.CharField(max_length=255)
    volume_initial = models.DecimalField(max_digits=10, decimal_places=2)
    volume_disponible = models.DecimalField(max_digits=10, decimal_places=2)
    date_disponibilite = models.DateField()
    commentaires_analyses = models.TextField(null=True, blank=True)
    volume_vendu = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    acheteur = models.CharField(max_length=255, null=True, blank=True)
    date_achat = models.DateField(null=True, blank=True)
    periode_destockage = models.CharField(max_length=100, null=True, blank=True)
    localisation_projet = models.CharField(max_length=255, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_produit:
            prefix = self.chantier.nom[:4].upper() if self.chantier and self.chantier.nom else "XXXX"
            annee = str(date.today().year)
            count = ProduitVente.objects.filter(chantier=self.chantier).count() + 1
            self.reference_produit = f"{prefix}-{annee}-VENTE-{count:03}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Produit {self.reference_produit}"

    class Meta:
        db_table = 'produit_vente'
        verbose_name = "Produit de vente"
        verbose_name_plural = "Produits de vente"
        ordering = ['-date_disponibilite']


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

    def __str__(self):
        return f"{self.type_document} pour {self.produit.reference_produit}"

    class Meta:
        db_table = 'document_technique'
        verbose_name = "Document technique"
        verbose_name_plural = "Documents techniques"
        ordering = ['-date_ajout']

# Document lié à un gisement
class DocumentGisement(models.Model):
    gisement = models.ForeignKey('Gisement', on_delete=models.CASCADE, related_name='documents')
    nom_fichier = models.CharField(max_length=255, null=True, blank=True)
    fichier = models.FileField(upload_to=document_upload_path, null=True, blank=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.nom_fichier:
            prefix = datetime.now().strftime('%y')  # "25"
            nom_sans_accent = format_nom_gisement(self.gisement.commune)
            count = DocumentGisement.objects.filter(gisement=self.gisement).count() + 1
            num = str(count).zfill(2)  # 01, 02, 03...
            self.nom_fichier = f"{prefix}_{nom_sans_accent}_{num}.pdf"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nom_fichier

    class Meta:
        db_table = 'document_gisement'
        ordering = ['-date_ajout']

class AnalyseLaboratoire(models.Model):
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
