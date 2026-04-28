-- Reactions par photo
CREATE TABLE IF NOT EXISTS reaction_media (
    id_utilisateur INT NOT NULL,
    id_media       INT NOT NULL,
    type           ENUM('like','spot','palette','lieu') NOT NULL,
    date_reaction  DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_utilisateur, id_media, type),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_media)       REFERENCES media(id_media)             ON DELETE CASCADE
);

-- Badge utilisateur
ALTER TABLE utilisateur
    ADD COLUMN IF NOT EXISTS badge ENUM('amateur','pro','pro_offres') NULL DEFAULT NULL;
