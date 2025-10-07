# Module Suivi Stock Plateforme

Ce module Angular fournit une interface complète pour la gestion du suivi des stocks d'andains sur les plateformes de terres fertiles.

## Structure du Module

```
src/app/pages/suivistock/
├── suivistock-list/           # Liste des suivis de stock
├── suivistock-create/         # Création d'un nouveau suivi
├── suivistock-detail/         # Détails d'un suivi
├── suivistock-edit/           # Modification d'un suivi
├── suivistock-dashboard/      # Tableau de bord avec statistiques
├── suivistock.routes.ts       # Configuration des routes
├── index.ts                   # Exports principaux
└── README.md                  # Cette documentation
```

## Composants

### SuivistockDashboardComponent
- **Route**: `/suivistock/dashboard`
- **Fonctionnalités**:
  - Affichage des statistiques globales
  - Répartition des statuts des andains
  - Évolution temporelle des créations
  - Liste des suivis récents
  - Alertes pour les stocks faibles et andains anciens

### SuivistockListComponent
- **Route**: `/suivistock/list`
- **Fonctionnalités**:
  - Liste paginée des suivis de stock
  - Filtres par plateforme, statut, dates
  - Recherche textuelle
  - Actions en lot (marquer écoulé, prêt pour vente)
  - Export CSV
  - Tri par colonnes

### SuivistockCreateComponent
- **Route**: `/suivistock/create`
- **Fonctionnalités**:
  - Formulaire de création par étapes (stepper)
  - Validation des données
  - Vérification d'unicité des andains
  - Calculs automatiques de volumes
  - Prévisualisation des données

### SuivistockDetailComponent
- **Route**: `/suivistock/:id`
- **Fonctionnalités**:
  - Affichage détaillé d'un suivi
  - Métriques et calculs en temps réel
  - Interface à onglets
  - Chronologie des dates
  - Actions (modifier, supprimer)

### SuivistockEditComponent
- **Route**: `/suivistock/:id/edit`
- **Fonctionnalités**:
  - Modification par formulaire à étapes
  - Validation des modifications
  - Aperçu des calculs
  - Gestion des modifications non sauvegardées

## Services Utilisés

### SuiviStockPlateformeService
- Service pour les opérations CRUD
- Méthodes de filtrage et recherche
- Actions en lot
- Export de données
- Statistiques

## Modèles de Données

### SuiviStockPlateforme
Interface principale représentant un suivi de stock avec toutes ses propriétés.

### CreateSuiviStockPlateforme
Interface pour la création d'un nouveau suivi (propriétés obligatoires).

### UpdateSuiviStockPlateforme
Interface pour la modification d'un suivi existant.

## Fonctionnalités Principales

### Gestion des Volumes
- Volume initial (m³)
- Volume restant (m³) 
- Volume écoulé (calculé automatiquement)
- Taux d'écoulement (pourcentage)

### Suivi Temporel
- Date de mise en andains
- Date de mise en culture
- Date prévisionnelle de vente
- Date d'écoulement effectif

### Statuts
- `en_stock`: Andain disponible
- `en_cours_ecoulement`: En cours de vente
- `ecoule`: Complètement vendu
- `suspendu`: Temporairement indisponible

### Filtrage et Recherche
- Par plateforme
- Par statut
- Par plage de dates
- Recherche textuelle
- Tri multicritères

### Actions en Lot
- Marquer plusieurs andains comme écoulés
- Marquer comme prêts pour la vente
- Export CSV sélectif

## Routes Disponibles

```typescript
/suivistock/                    → Redirection vers dashboard
/suivistock/dashboard          → Tableau de bord
/suivistock/list              → Liste des suivis
/suivistock/create            → Créer un suivi
/suivistock/:id               → Détails d'un suivi
/suivistock/:id/edit          → Modifier un suivi
```

## Utilisation

### Import du Module
```typescript
import { 
  SUIVISTOCK_ROUTES, 
  SUIVISTOCK_COMPONENTS 
} from './pages/suivistock';

// Dans votre configuration de routes
{
  path: 'suivistock',
  children: SUIVISTOCK_ROUTES
}
```

### Composants Standalone
Tous les composants sont configurés comme `standalone: true` et peuvent être importés individuellement.

### Dépendances Angular Material
- MatCardModule
- MatButtonModule
- MatIconModule
- MatFormFieldModule
- MatInputModule
- MatSelectModule
- MatDatepickerModule
- MatTableModule
- MatPaginatorModule
- MatSortModule
- MatCheckboxModule
- MatChipsModule
- MatTabsModule
- MatStepperModule
- MatProgressSpinnerModule
- MatSnackBarModule
- MatDialogModule

## Responsive Design

L'interface est entièrement responsive avec des breakpoints pour :
- Desktop (>768px)
- Tablet (768px-480px)
- Mobile (<480px)

## Accessibilité

- Navigation au clavier
- Labels ARIA appropriés
- Contrastes de couleurs conformes
- Support des lecteurs d'écran

## Tests

Pour tester le module :
```bash
ng test --include="**/suivistock/**"
```

## Performance

- Lazy loading des composants
- Pagination côté serveur
- Debounce sur les recherches
- Mise en cache des listes de référence

## Internationalisation

Le module est prêt pour l'i18n avec :
- Textes extractibles
- Formats de dates localisés
- Formatage des nombres

## Évolutions Prévues

1. Intégration de graphiques (Chart.js/D3.js)
2. Mode hors ligne avec synchronisation
3. Notifications push pour les alertes
4. Export PDF des rapports
5. Historique des modifications
6. Commentaires et annotations
7. Photos des andains
8. Géolocalisation des plateformes

## Support

Pour toute question ou problème, consulter la documentation technique ou contacter l'équipe de développement.