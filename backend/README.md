# Incident Reporter API

Cette API REST propulse le backend pour l'application Incident Reporter, construite sans frameworks lourds avec du PHP pur afin de garantir la plus haute flexibilité et légèreté.
L'API implémente:
- Un conteneur d'injection de dépendances (DI) personnalisé.
- Un routeur dynamique avec support des middlewares.
- Sécurisation des endpoints via JSON Web Tokens (JWT).
- Support des Caches Redis pour des listes et statistiques accélérées.
- Intégration MySQL robuste respectant la spécificité des types et relations imposé par la communauté.
- Un système d'upload de fichiers pour capturer les preuves d'incidents, avec stockage et suppression dynamique.

## Stack Technologique
- **PHP 8.2+** 
- **MySQL 8.0**
- **Nginx**
- **Redis 7**
- **Docker & Docker Compose**

## Démarrage Rapide (Développement Local)

1. Assurez-vous d'avoir Docker et Docker Compose installés sur votre machine (en parallèle de PHP 8.2+ si vous installez des librairies via composer hostées).
2. Lancez les conteneurs :
   ```bash
   docker compose up -d
   ```
3. L'API est servie sur `http://localhost:8080`.
4. Tests de l'état de santé :
   ```bash
   curl -s -i "http://localhost:8080/api/health"
   ```

## Tests

Installer les dépendances et exécuter les tests Unitaires et d'Intégration.

```bash
docker compose exec php composer install
docker compose exec php vendor/bin/phpunit tests
```

Pour les tests avec la base de données, l'API intègre `database/seed.sql` qui pré-construit des utilisateurs (Admin@1234, User@1234) et quelques catégories initiales. Les tests réinitialisent ou vérifient l'état conforme.

## Endpoints Principaux

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `GET /api/categories`  (Cache activé 3600s)
- `GET /api/incidents`   (Cache activé 300s)
- `POST /api/incidents/report` (Soumission Anonyme)
- `POST /api/incidents`   (Protégé JWT)

## Rétrocompatibilité IDE
Si votre éditeur de code IDE (VS Code / PHPStorm) signale une erreur de syntaxe à cause du mot-clé `Default` dans le dossier `vendor` ou du `readonly` en `PHP 8.2`, assurez-vous de régler le **PHP Language Level de votre IDE** sur `8.2()` minimum car le conteneur lui exécute bien en `PHP 8.2.30+`.
