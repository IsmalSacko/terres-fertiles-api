# Guide de Test - Intégration Frontend-Backend

## 🚀 **Démarrage Rapide**

### 1. **Démarrer le Backend Django**
```bash
cd c:\Users\ismal\projets\terres-fertiles-api
.\venv\Scripts\activate
python manage.py runserver
```

### 2. **Démarrer le Frontend Angular**
```bash
cd c:\Users\ismal\projets\terres-fertiles-api\admin-terres-fertiles
npm start
```

### 3. **Accéder au Module SuiviStock**
- URL: `http://localhost:4200/suivistock`
- Navigation: Dashboard → Suivi des Stocks

## 🧪 **Tests à Effectuer**

### ✅ **Test 1 : Dashboard**
- [ ] Accéder à `/suivistock`
- [ ] Vérifier l'affichage des statistiques
- [ ] Tester le filtre par plateforme
- [ ] Vérifier les alertes si données disponibles

### ✅ **Test 2 : Liste des Suivis**
- [ ] Accéder à `/suivistock/list`
- [ ] Tester les filtres (plateforme, mélange, statut)
- [ ] Tester la pagination
- [ ] Tester la recherche textuelle
- [ ] Tester les actions en lot (marquer écoulé, prêt vente)
- [ ] Tester l'export CSV

### ✅ **Test 3 : Création**
- [ ] Accéder à `/suivistock/create`
- [ ] Remplir tous les champs obligatoires
- [ ] Tester la validation unicité andain/plateforme
- [ ] Tester la validation des volumes
- [ ] Créer un suivi avec succès

### ✅ **Test 4 : Détail**
- [ ] Accéder à `/suivistock/:id`
- [ ] Vérifier toutes les informations affichées
- [ ] Tester les actions (modifier, supprimer)
- [ ] Vérifier les propriétés calculées

### ✅ **Test 5 : Modification**
- [ ] Accéder à `/suivistock/:id/edit`
- [ ] Modifier des champs
- [ ] Tester les validations
- [ ] Sauvegarder avec succès

## 🔧 **Tests API Directs**

### Avec Postman/cURL :

#### Obtenir un token
```bash
curl -X POST http://localhost:8000/auth/token/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "votre_username", "password": "votre_password"}'
```

#### Lister les suivis
```bash
curl -X GET http://localhost:8000/api/suivi-stock-plateforme/ \
  -H "Authorization: Token your_token_here"
```

#### Créer un suivi
```bash
curl -X POST http://localhost:8000/api/suivi-stock-plateforme/ \
  -H "Authorization: Token your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "andain_numero": 999,
    "plateforme": 1,
    "melange": 1,
    "volume_initial_m3": 100.0,
    "volume_restant_m3": 100.0,
    "statut": "en_cours",
    "date_mise_en_andains": "2024-10-07"
  }'
```

#### Vérifier unicité andain
```bash
curl -X GET "http://localhost:8000/api/suivi-stock-plateforme/verifier-andain/?plateforme=1&andain_numero=999" \
  -H "Authorization: Token your_token_here"
```

#### Obtenir des statistiques
```bash
curl -X GET http://localhost:8000/api/suivi-stock-plateforme/statistiques/ \
  -H "Authorization: Token your_token_here"
```

## 🚨 **Points de Vérification**

### **Authentification**
- [ ] Le token est bien envoyé dans les headers
- [ ] Les erreurs 401 sont gérées côté frontend
- [ ] La redirection vers login fonctionne si non authentifié

### **Gestion d'Erreurs**
- [ ] Erreurs de validation affichées correctement
- [ ] Messages de succès/erreur en français
- [ ] Gestion des erreurs réseau (serveur indisponible)

### **Performance**
- [ ] Chargement rapide des listes
- [ ] Pagination fonctionnelle
- [ ] Pas de requêtes N+1 (vérifier en mode dev Django)

### **UX/UI**
- [ ] Interface responsive
- [ ] Loading states visibles
- [ ] Formulaires intuitifs
- [ ] Navigation cohérente

## 📊 **Données de Test**

### Créer des données via Django Admin:
1. Créer une plateforme
2. Créer un mélange
3. Créer quelques suivis de stock avec différents statuts

### Ou utiliser les fixtures Django:
```bash
python manage.py loaddata fixtures/test_data.json
```

## 🐛 **Debugging**

### Backend Django
- Vérifier les logs: `python manage.py runserver --verbosity=2`
- Django Debug Toolbar pour les requêtes SQL
- Vérifier les permissions dans les vues

### Frontend Angular
- Ouvrir DevTools → Network pour voir les requêtes
- Console pour les erreurs JavaScript
- Angular DevTools pour l'état des composants

## ✅ **Checklist Final**

- [ ] Toutes les routes fonctionnent
- [ ] Tous les formulaires se soumettent
- [ ] Toutes les validations fonctionnent
- [ ] Les données s'affichent correctement
- [ ] Les actions en lot fonctionnent
- [ ] L'export CSV fonctionne
- [ ] Les statistiques s'affichent
- [ ] Pas d'erreurs console
- [ ] Interface responsive
- [ ] Performance acceptable

## 🎯 **Résultat Attendu**

Un module de suivi de stock **complet et fonctionnel** permettant de :
- Créer, modifier, supprimer des suivis
- Visualiser un dashboard avec statistiques
- Effectuer des actions en lot
- Exporter des données
- Valider l'unicité des andains
- Suivre l'évolution des volumes