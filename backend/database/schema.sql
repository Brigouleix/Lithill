-- Lithill — Schéma de base de données
-- Charset : utf8mb4 / Collation : utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS lithill CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lithill;

CREATE TABLE utilisateur (
    id_utilisateur          INT PRIMARY KEY AUTO_INCREMENT,
    email                   VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe            VARCHAR(255) NOT NULL,
    pseudo                  VARCHAR(50)  UNIQUE NOT NULL,
    nom                     VARCHAR(100),
    prenom                  VARCHAR(100),
    role                    ENUM('admin','createur','visiteur') DEFAULT 'visiteur',
    avatar                  VARCHAR(500),
    bio                     TEXT,
    statut                  ENUM('actif','banni','en_attente') DEFAULT 'en_attente',
    date_inscription        DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_derniere_connexion DATETIME,
    INDEX idx_email  (email),
    INDEX idx_pseudo (pseudo)
);

CREATE TABLE portfolio (
    id_portfolio    INT PRIMARY KEY AUTO_INCREMENT,
    id_utilisateur  INT NOT NULL UNIQUE,
    titre           VARCHAR(255) NOT NULL,
    description     TEXT,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    visibilite      ENUM('public','prive') DEFAULT 'public',
    date_creation   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_slug (slug)
);

CREATE TABLE projet (
    id_projet          INT PRIMARY KEY AUTO_INCREMENT,
    id_portfolio       INT NOT NULL,
    titre              VARCHAR(255) NOT NULL,
    description        TEXT,
    slug               VARCHAR(255) UNIQUE NOT NULL,
    statut             ENUM('publie','brouillon','archive') DEFAULT 'brouillon',
    nb_vues            INT DEFAULT 0,
    date_publication   DATETIME,
    date_creation      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_portfolio) REFERENCES portfolio(id_portfolio) ON DELETE CASCADE,
    INDEX idx_slug   (slug),
    INDEX idx_statut (statut)
);

CREATE TABLE media (
    id_media         INT PRIMARY KEY AUTO_INCREMENT,
    id_projet        INT NOT NULL,
    nom_fichier      VARCHAR(255) NOT NULL,
    url_stockage     VARCHAR(500) NOT NULL,
    type_mime        VARCHAR(100) NOT NULL,
    taille_octets    INT NOT NULL,
    ordre_affichage  INT DEFAULT 0,
    date_upload      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_projet) REFERENCES projet(id_projet) ON DELETE CASCADE
);

CREATE TABLE categorie (
    id_categorie INT PRIMARY KEY AUTO_INCREMENT,
    nom          VARCHAR(100) UNIQUE NOT NULL,
    slug         VARCHAR(100) UNIQUE NOT NULL,
    description  TEXT
);

CREATE TABLE tag (
    id_tag INT PRIMARY KEY AUTO_INCREMENT,
    nom    VARCHAR(50) UNIQUE NOT NULL,
    slug   VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE commentaire (
    id_commentaire  INT PRIMARY KEY AUTO_INCREMENT,
    id_projet       INT NOT NULL,
    id_utilisateur  INT NOT NULL,
    contenu         TEXT NOT NULL,
    statut          ENUM('publie','signale','supprime') DEFAULT 'publie',
    date_creation   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_projet)      REFERENCES projet(id_projet)           ON DELETE CASCADE,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE like_projet (
    id_utilisateur  INT NOT NULL,
    id_projet       INT NOT NULL,
    date_like       DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_utilisateur, id_projet),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_projet)      REFERENCES projet(id_projet)           ON DELETE CASCADE
);

CREATE TABLE projet_categorie (
    id_projet    INT NOT NULL,
    id_categorie INT NOT NULL,
    PRIMARY KEY (id_projet, id_categorie),
    FOREIGN KEY (id_projet)    REFERENCES projet(id_projet)       ON DELETE CASCADE,
    FOREIGN KEY (id_categorie) REFERENCES categorie(id_categorie) ON DELETE CASCADE
);

CREATE TABLE projet_tag (
    id_projet INT NOT NULL,
    id_tag    INT NOT NULL,
    PRIMARY KEY (id_projet, id_tag),
    FOREIGN KEY (id_projet) REFERENCES projet(id_projet) ON DELETE CASCADE,
    FOREIGN KEY (id_tag)    REFERENCES tag(id_tag)       ON DELETE CASCADE
);

-- Sécurité ANSSI
CREATE TABLE session (
    id_session      INT PRIMARY KEY AUTO_INCREMENT,
    id_utilisateur  INT NOT NULL,
    token           VARCHAR(512) UNIQUE NOT NULL,
    ip_adresse      VARCHAR(45) NOT NULL,
    user_agent      TEXT,
    date_creation   DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_expiration DATETIME NOT NULL,
    est_active      TINYINT(1) DEFAULT 1,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_token      (token),
    INDEX idx_expiration (date_expiration)
);

CREATE TABLE log_audit (
    id_log          INT PRIMARY KEY AUTO_INCREMENT,
    id_utilisateur  INT,
    action          VARCHAR(100) NOT NULL,
    ip_adresse      VARCHAR(45) NOT NULL,
    user_agent      TEXT,
    details         JSON,
    date_action     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL,
    INDEX idx_action (action),
    INDEX idx_date   (date_action)
);

-- RGPD / Cookies
CREATE TABLE consentement_cookie (
    id_consentement   INT PRIMARY KEY AUTO_INCREMENT,
    id_utilisateur    INT,
    type_cookie       ENUM('fonctionnel','analytique','marketing') NOT NULL,
    statut            ENUM('accepte','refuse') NOT NULL,
    date_consentement DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_expiration   DATETIME NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- Données initiales
INSERT INTO categorie (nom, slug, description) VALUES
    ('Photographie',  'photographie',  'Photos et retouches'),
    ('Illustration',  'illustration',  'Dessins et illustrations numériques'),
    ('Développement', 'developpement', 'Sites web, apps, logiciels'),
    ('Design',        'design',        'UI/UX, graphisme, motion'),
    ('Musique',       'musique',       'Compositions, productions'),
    ('Vidéo',         'video',         'Films courts, montages, clips'),
    ('3D',            '3d',            'Modélisation et animation 3D'),
    ('Écriture',      'ecriture',      'Textes, nouvelles, poésie');

INSERT INTO utilisateur (email, mot_de_passe, pseudo, nom, prenom, role, statut) VALUES
    ('admin@lithill.local', '$2y$12$placeholderHashRemplacerAvantProd', 'admin', 'Admin', 'Lithill', 'admin', 'actif');
