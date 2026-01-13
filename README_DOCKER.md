Résumé rapide — MySQL + phpMyadmin

1) Fichiers ajoutés
- `docker-compose.yml` (à la racine)
- `.env.docker` (à la racine)

2) Démarrer les conteneurs

Ouvrez un terminal à la racine du projet puis:

```bash
docker compose up -d
```

3) Accès
- phpMyAdmin: http://localhost:8080
- MySQL: hôte `localhost:3306` (depuis l'hôte), ou `db:3306` depuis d'autres conteneurs
- utilisateur: la valeur de `DATABASEUSER` (par défaut `root`)
- mot de passe: la valeur de `DATABASEPASSWORD` (par défaut `sacko`)

4) Remarque Django
- En environnement Docker, configurez dans votre `.env` ou variables d'environnement `HOST=db` (ou changez `HOST` dans `settings.py`) pour que Django se connecte au service MySQL `db`.

5) Stopper et nettoyer

```bash
docker compose down -v
```
