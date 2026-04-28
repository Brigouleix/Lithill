-- Migration 005 : ajout de nouvelles catégories
-- À exécuter dans phpMyAdmin

INSERT IGNORE INTO categorie (nom, slug, description) VALUES
    ('IA',         'ia',         'Créations générées ou assistées par intelligence artificielle'),
    ('Nature',     'nature',     'Paysages, faune, flore et environnement naturel'),
    ('Voyage',     'voyage',     'Photographies et créations de voyages et découvertes'),
    ('Portrait',   'portrait',   'Portraits humains, études de visages et expressions'),
    ('Espace',     'espace',     'Astronomie, cosmos, nébuleuses et exploration spatiale'),
    ('Peinture',   'peinture',   'Peintures numériques et traditionnelles'),
    ('Sculpture',  'sculpture',  'Sculptures, installations et art en volume');
