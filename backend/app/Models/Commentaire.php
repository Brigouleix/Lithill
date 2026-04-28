<?php
namespace App\Models;

class Commentaire extends Model
{
    protected static string $table = 'commentaire';
    protected static string $pk    = 'id_commentaire';

    public static function forProjet(int $projetId): array
    {
        $stmt = static::db()->prepare(
            "SELECT c.*, u.pseudo, u.avatar
             FROM commentaire c
             JOIN utilisateur u ON u.id_utilisateur = c.id_utilisateur
             WHERE c.id_projet = ? AND c.statut = 'publie'
             ORDER BY c.date_creation ASC"
        );
        $stmt->execute([$projetId]);
        return $stmt->fetchAll();
    }

    public static function signales(int $offset, int $limit): array
    {
        $stmt = static::db()->prepare(
            "SELECT c.*, u.pseudo, p.titre AS projet_titre
             FROM commentaire c
             JOIN utilisateur u ON u.id_utilisateur = c.id_utilisateur
             JOIN projet p ON p.id_projet = c.id_projet
             WHERE c.statut = 'signale'
             ORDER BY c.date_creation DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }
}
