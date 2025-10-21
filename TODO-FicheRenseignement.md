# Todo — Fiche de renseignement (tablette)

- [ ] Concevoir le modèle Fiche de renseignement (🔄 EN COURS)
  - Objectif : décider cardinalité avec `Gisement` (OneToMany recommandé pour garder un historique ; OneToOne si strictement une fiche par gisement).
  - Modèles proposés :
    - `FicheRenseignement` : gisement (FK), projet, date_prélèvement, date_envoi, objectifs (texte), environnement, adresse, localisation (lat, lon), entreprise_livraison (json/texte), entreprise_facturation (json/texte), notes, created_by, created_at.
    - `FichePhoto` : fiche (FK), image (ImageField), legende, ordre.
    - `Echantillon` : fiche (FK), nom, menu_analyse (Choice), profondeur, precisions, éventuelles photos (FK ou ManyToMany).
  - Contraintes : tous les champs liés à la fiche doivent être optionnels / nullable pour permettre création du gisement sans fiche.

- [ ] Concevoir l'API Django REST
  - Sérializers imbriqués pour `FicheRenseignement`, `Echantillon`, `FichePhoto`.
  - ViewSets / endpoints : GET, POST, PUT, PATCH, DELETE.
  - Support upload multipart/form-data pour images.
  - Permissions : token auth, restrictions par plateforme/entreprise si nécessaire.
  - Filtres : par `gisement`, par producteur ; pagination optionnelle.

- [ ] Stockage des fichiers et validation
  - Utiliser `ImageField` + MEDIA_ROOT local (option S3 via `django-storages` si besoin).
  - Validation : types MIME, taille max par image (ex. 5 MB), nombre max d'images par fiche (ex. 12).
  - Chemin organisé : `media/fiches/<gisement_id>/<fiche_id>/photos/`.
  - Génération de miniatures (optionnelle).

- [ ] Plan UI/UX pour tablette (formulaire digital)
  - Reproduire la fiche papier pour tablette : sections distinctes, champs larges, boutons tactiles.
  - Upload photo via caméra/galerie, preview en grille, reorder/delete.
  - GPS : bouton "Localiser" utilisant Geolocation API + possibilité d'éditer coords sur une carte.
  - Support hors‑ligne basique : sauvegarde brouillon et synchronisation automatique.
  - Orientation : responsive portrait & landscape.

- [ ] Concevoir composants frontend Angular
  - Composants proposés :
    - `fiche-renseignement-create` / `edit` / `detail`
    - `echantillon-repeater` (FormArray)
    - `photo-uploader` (preview, reorder, delete, capture caméra)
    - `map-picker` modal (Leaflet/Mapbox)
  - Service HTTP (axios) : upload multipart, endpoints CRUD.
  - CTA dans `GisementDetail` : bouton "Ajouter fiche" / "Voir fiches".

- [ ] Tests et quality gates
  - Backend : tests modèles, serializers, endpoints (happy path + validations).
  - Frontend : unit tests pour le formulaire, e2e minimal (création fiche avec images).
  - Lint, build, et intégration dans CI.

- [ ] Implémentation incrémentale backend (après validation)
  - Étapes : 1) modèles + migrations, 2) serializers + ViewSets, 3) routes API + permissions, 4) tests backend.
  - Ne pas modifier le modèle `Gisement` existant sauf pour ajouter une relation nullable (FK/OneToOne).

- [ ] Implémentation frontend (après backend)
  - Étapes : 1) service HTTP & endpoints, 2) formulaire create minimal (sans map), 3) photo capture & previews, 4) UX polishing (map, reorder, brouillons).

- [ ] Déploiement, migration et sauvegarde
  - Préparer plan de migration DB, config MEDIA en prod, vérification quotas stockage et backups.
  - Si S3 utilisé : config credentials et tests upload.

- [ ] Documentation & formation terrain
  - Créer courte documentation pour usage tablette : workflow (créer gisement → ajouter fiche → sync), bonnes pratiques photos, checklist pour technicien.
