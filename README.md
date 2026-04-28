# Lithill

Plateforme de portfolio pour créateurs — projet de fin d'études.

## Stack

| Côté | Techno |
|------|--------|
| Frontend | React 18 · React Router v6 · CSS Modules |
| Backend | PHP 8 MVC maison (sans framework) · PDO |
| Base de données | MySQL / MariaDB |
| Auth | Token 64-char hex · table `session` |

## Fonctionnalités

- **Multi-portfolio** par compte — chaque portfolio est un album de projets
- **Galerie photo** par projet — navigation clavier / clic / flèches, strip de miniatures
- **Réactions par photo** — ❤️ Like · 💡 Lumière · 🎨 Couleurs · 📸 Lieu
- **Badges utilisateur** — Amateur · Pro · Pro ouvert aux offres (couleur dynamique sur l'avatar)
- **Bannière & avatar** importables, photo de couverture par portfolio
- **Statistiques** de publication — réactions par émoji, tri par vues / date / total
- **4 thèmes** — Ambre ☀ · Forêt 🌿 · Lagon ≋ · Sombre ☾ (persisté en localStorage)
- **Système d'amis** — demande, acceptation, suppression
- **Galerie sociale** — fil des projets des comptes suivis
- **Explorateur** — recherche et découverte de projets publics
- **Panel admin** — gestion utilisateurs, modération, logs d'audit

## Lancer le projet en local

### Prérequis

- PHP 8.1+ avec les extensions `pdo_mysql`, `fileinfo`, `mbstring`
- Composer
- Node.js 18+
- MySQL / MariaDB

### Backend

```bash
cd backend
composer install
cp .env.example .env
# Remplir DB_HOST, DB_NAME, DB_USER, DB_PASS dans .env
```

Importer la base :

```sql
-- Dans phpMyAdmin ou MySQL CLI :
SOURCE backend/database/schema.sql;
SOURCE backend/database/migrations/002_amis_abonnements.sql;
SOURCE backend/database/migrations/003_reactions_badges.sql;
SOURCE backend/database/migrations/004_banniere_couverture.sql;
SOURCE backend/database/migrations/005_categories.sql;
```

Démarrer le serveur PHP :

```bash
cd backend/public
php -S localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm start        # dev sur http://localhost:3000
npm run build    # build de production
```

## Structure

```
lithill/
├── backend/
│   ├── app/
│   │   ├── Controllers/   # AuthController, ProjetController, PortfolioController…
│   │   ├── Core/          # Router, Controller, Auth
│   │   ├── Middleware/    # Auth, CSRF, RateLimit
│   │   ├── Models/        # Utilisateur, Projet, Portfolio, Media…
│   │   └── Utils/         # Validator, Security, FileUpload
│   ├── config/            # database.php, security.php
│   ├── database/
│   │   ├── schema.sql
│   │   └── migrations/
│   ├── public/            # Point d'entrée index.php + uploads/
│   └── routes/api.php
└── frontend/
    └── src/
        ├── components/common/   # Header, Footer, UserBadge…
        ├── context/             # AuthContext, ThemeContext
        ├── pages/               # Dashboard, Projet, Portfolio, Explore…
        ├── services/api.js      # Axios + intercepteurs token/CSRF
        └── styles/index.css     # Design system — variables CSS + 4 thèmes
```

## Variables d'environnement

Copier `backend/.env.example` en `backend/.env` et renseigner :

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Hôte MySQL |
| `DB_NAME` | Nom de la base |
| `DB_USER` | Utilisateur MySQL |
| `DB_PASS` | Mot de passe MySQL |
| `APP_URL` | URL du backend |
| `FRONTEND_URL` | URL du frontend (CORS) |
