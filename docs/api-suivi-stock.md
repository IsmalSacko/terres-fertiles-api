# API Suivi Stock Plateforme

## Endpoints disponibles

### Base URL: `/api/suivi-stock-plateforme/`

## 📋 **CRUD Operations**

### 1. **GET** `/api/suivi-stock-plateforme/`
**Lister tous les suivis de stock**

**Query Parameters:**
- `plateforme` - Filtrer par ID de plateforme
- `melange` - Filtrer par ID de mélange
- `statut` - Filtrer par statut (`en_cours`, `en_culture`, `pret_vente`, `ecoule`, `suspendu`)
- `date_debut` - Filtrer par date (YYYY-MM-DD)
- `date_fin` - Filtrer par date (YYYY-MM-DD)
- `search` - Recherche textuelle (référence, plateforme, mélange, recette, remarques)

**Exemple:**
```
GET /api/suivi-stock-plateforme/?plateforme=1&statut=en_cours&search=compost
```

### 2. **POST** `/api/suivi-stock-plateforme/`
**Créer un nouveau suivi de stock**

**Body:**
```json
{
    "andain_numero": 15,
    "plateforme": 1,
    "melange": 2,
    "volume_initial_m3": 250.50,
    "volume_restant_m3": 250.50,
    "statut": "en_cours",
    "date_mise_en_andains": "2024-10-07",
    "recette": "Mélange terre végétale + compost",
    "remarques": "Andain prêt pour maturation"
}
```

### 3. **GET** `/api/suivi-stock-plateforme/{id}/`
**Récupérer un suivi de stock spécifique**

### 4. **PUT** `/api/suivi-stock-plateforme/{id}/`
**Mettre à jour un suivi de stock**

### 5. **DELETE** `/api/suivi-stock-plateforme/{id}/`
**Supprimer un suivi de stock**

## 🔧 **Actions spéciales**

### 6. **POST** `/api/suivi-stock-plateforme/marquer-ecoule/`
**Marquer des andains comme écoulés (en lot)**

**Body:**
```json
{
    "ids": [1, 2, 3, 4]
}
```

**Response:**
```json
{
    "message": "3 andain(s) marqué(s) comme écoulé(s)",
    "count": 3
}
```

### 7. **POST** `/api/suivi-stock-plateforme/marquer-pret-vente/`
**Marquer des andains comme prêts pour vente**

**Body:**
```json
{
    "ids": [5, 6, 7]
}
```

### 8. **POST** `/api/suivi-stock-plateforme/exporter-csv/`
**Exporter en CSV**

**Body (optionnel):**
```json
{
    "ids": [1, 2, 3]  // Export sélectif, sinon tout
}
```

**Response:** Fichier CSV téléchargeable

### 9. **GET** `/api/suivi-stock-plateforme/verifier-andain/`
**Vérifier disponibilité d'un numéro d'andain**

**Query Parameters:**
- `plateforme` (requis) - ID de la plateforme
- `andain_numero` (requis) - Numéro à vérifier
- `exclude_id` (optionnel) - ID à exclure (pour modification)

**Exemple:**
```
GET /api/suivi-stock-plateforme/verifier-andain/?plateforme=1&andain_numero=15
```

**Response:**
```json
{
    "disponible": false,
    "message": "Un andain avec le numéro 15 existe déjà sur cette plateforme",
    "existant": {
        "id": 23,
        "reference_suivi": "SF1024-15",
        "melange_nom": "Mélange Compost A",
        "statut": "En cours"
    }
}
```

### 10. **GET** `/api/suivi-stock-plateforme/statistiques/`
**Obtenir des statistiques**

**Query Parameters:**
- `plateforme` (optionnel) - Statistiques pour une plateforme spécifique

**Response:**
```json
{
    "total_andains": 45,
    "volume_total_initial": 12500.75,
    "volume_total_restant": 8750.25,
    "taux_ecoulement_moyen": 68.5,
    "repartition_statuts": {
        "en_cours": 15,
        "en_culture": 8,
        "pret_vente": 12,
        "ecoule": 8,
        "suspendu": 2
    },
    "andains_par_mois": {
        "2024-08": 5,
        "2024-09": 12,
        "2024-10": 8
    }
}
```

## 🔒 **Authentification**

Toutes les routes nécessitent une authentification via Token:

```
Authorization: Token your_token_here
```

## 📊 **Format de réponse standard**

### Suivi de stock complet:
```json
{
    "id": 1,
    "andain_numero": 15,
    "reference_suivi": "SF1024-15",
    "plateforme": 1,
    "plateforme_details": {
        "id": 1,
        "nom": "Plateforme Nord",
        "localisation": "Zone industrielle Nord",
        "entreprise_gestionnaire": "TerreVerte SARL"
    },
    "melange": 2,
    "melange_details": {
        "id": 2,
        "nom": "Mélange Compost A",
        "etat": 3,
        "etat_display": "Prêt"
    },
    "produit_vente": null,
    "produit_vente_details": null,
    "volume_initial_m3": "250.50",
    "volume_restant_m3": "180.00",
    "volume_ecoule_m3": "70.50",
    "taux_ecoulement_percent": 28.14,
    "statut": "en_culture",
    "statut_display": "En culture",
    "date_mise_en_andains": "2024-09-15",
    "date_mise_en_culture": "2024-10-01",
    "date_previsionnelle_vente": "2024-11-15",
    "date_ecoulement": null,
    "recette": "Mélange terre végétale (70%) + compost (30%)",
    "remarques": "Maturation en cours, contrôle hebdomadaire",
    "duree_stockage_jours": 22,
    "utilisateur": 1,
    "utilisateur_details": {
        "id": 1,
        "username": "admin",
        "company_name": "TerreVerte SARL"
    },
    "date_creation": "2024-09-15T10:30:00Z",
    "date_modification": "2024-10-07T14:20:00Z"
}
```

## ✅ **Codes d'erreur**

- `200` - Succès
- `201` - Créé avec succès
- `400` - Erreur de validation
- `401` - Non authentifié
- `404` - Ressource non trouvée
- `500` - Erreur serveur

## 🔍 **Validation**

### Règles de validation:
1. **Unicité**: Un numéro d'andain doit être unique par plateforme
2. **Volumes**: Le volume restant ne peut pas être supérieur au volume initial
3. **Champs requis**: `andain_numero`, `plateforme`, `melange`, `volume_initial_m3`, `volume_restant_m3`
4. **Statuts valides**: `en_cours`, `en_culture`, `pret_vente`, `ecoule`, `suspendu`

### Exemples d'erreurs:
```json
{
    "andain_numero": ["Un andain avec le numéro 15 existe déjà sur cette plateforme."],
    "volume_restant_m3": ["Le volume restant ne peut pas être supérieur au volume initial."]
}
```