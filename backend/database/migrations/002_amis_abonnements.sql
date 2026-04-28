-- Migration 002 — Système d'amis et d'abonnements
USE lithill;

CREATE TABLE amitie (
    id_amitie    INT PRIMARY KEY AUTO_INCREMENT,
    id_demandeur INT NOT NULL,
    id_recepteur INT NOT NULL,
    statut       ENUM('en_attente','accepte','refuse') DEFAULT 'en_attente',
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_pair (id_demandeur, id_recepteur),
    FOREIGN KEY (id_demandeur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_recepteur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

CREATE TABLE abonnement (
    id_abonne          INT NOT NULL,
    id_suivi           INT NOT NULL,
    date_abonnement    DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_abonne, id_suivi),
    FOREIGN KEY (id_abonne) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_suivi)  REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);
