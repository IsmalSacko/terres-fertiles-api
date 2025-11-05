# Formulaire de Modification de Saisie de Vente

## Description
Ce composant permet de modifier une saisie de vente existante avec toutes les validations nécessaires.

## Fonctionnalités

### 🎯 Fonctionnalités principales
- **Chargement automatique** des données existantes
- **Validation des champs** en temps réel
- **Vérification de disponibilité** des produits (uniquement si produit/volume changé)
- **Interface responsive** et moderne
- **Feedback visuel** avec snackbars et spinners

### 📋 Champs modifiables
- Nom du client
- Volume (en tonnes)
- Date de vente
- Nom du chantier récepteur
- Adresse du chantier
- Produit (sélection depuis la liste)
- Statut de validation

### 🛡️ Validations
- Nom client : minimum 2 caractères
- Volume : nombre positif minimum 0.01
- Date de vente : requise
- Chantier : minimum 2 caractères
- Adresse : minimum 5 caractères
- Produit : requis

## Navigation

### Accès au formulaire de modification
1. **Depuis la liste des saisies** : Cliquer sur le bouton d'édition (icône crayon) sur chaque carte
2. **URL directe** : `/saisies-vente/edit/{id}`

### Routes configurées
```typescript
{ path: 'saisies-vente/edit/:id', component: EditSaisieVenteComponent }
```

## Utilisation

### 1. Interface utilisateur
- **Design compact** : Formulaire en 2 colonnes sur desktop, 1 colonne sur mobile
- **Champs pré-remplis** : Toutes les données existantes sont automatiquement chargées
- **Indicateurs visuels** : Spinner pendant le chargement, validation en temps réel

### 2. Workflow de modification
1. L'utilisateur clique sur "Modifier" depuis la liste
2. Les données sont chargées automatiquement
3. L'utilisateur modifie les champs souhaités
4. Le système valide les changements
5. Redirection vers la liste après succès

### 3. Logique de vérification des stocks
- **Si le produit change** : Vérification complète de la disponibilité
- **Si le volume change** : Vérification du volume supplémentaire/réduit
- **Si aucun changement** : Pas de vérification (optimisation)

## API Utilisée

### Nouvelles méthodes ajoutées au service
```typescript
// Récupérer une saisie par ID
getSaisieVenteById(id: number): Promise<SaisieVenteResponse>

// Mettre à jour une saisie
updateSaisieVente(id: number, data: CreateSaisieVente): Promise<SaisieVenteResponse>
```

### Endpoints
- **GET** `/api/saisies-vente/{id}/` - Récupération des données
- **PUT** `/api/saisies-vente/{id}/` - Mise à jour

## Responsive Design

### Breakpoints
- **Desktop** (>900px) : Formulaire en 2 colonnes
- **Tablet** (650px-900px) : Formulaire en 1 colonne
- **Mobile** (<650px) : Boutons empilés verticalement

### Styles adaptatifs
- Grille flexible qui s'adapte à la taille d'écran
- Boutons responsive (largeur complète sur mobile)
- Espacement optimisé pour chaque taille

## Messages utilisateur

### Succès
- "Saisie de vente modifiée avec succès !"

### Erreurs possibles
- "ID de saisie invalide"
- "Erreur lors du chargement des produits"
- "Erreur lors du chargement de la saisie de vente"
- "Volume insuffisant pour ce produit !"
- "Erreur lors de la modification de la saisie de vente"

## Sécurité et Validation

### Côté client
- Validation des types (number, string, date)
- Validation des longueurs minimales
- Trim des espaces sur les champs texte
- Désactivation du bouton pendant la soumission

### Côté serveur
- Token d'authentification requis
- Validation des données côté API
- Vérification des autorisations

## Performance

### Optimisations
- Chargement conditionnel des produits
- Vérification de stock intelligente (seulement si nécessaire)
- Debounce sur les validations
- Lazy loading des composants

## Maintenance

### Fichiers concernés
- `edit-saisie-vente.component.ts` - Logique du composant
- `edit-saisie-vente.component.html` - Template
- `edit-saisie-vente.component.css` - Styles
- `create-saisie-vente.service.ts` - Service API
- `app.routes.ts` - Configuration des routes

### Tests
- Tests unitaires avec `edit-saisie-vente.component.spec.ts`
- Tests d'intégration recommandés pour les appels API
