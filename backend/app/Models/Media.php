<?php
namespace App\Models;

class Media extends Model
{
    protected static string $table = 'media';
    protected static string $pk    = 'id_media';

    public static function forProjet(int $projetId): array
    {
        $stmt = static::db()->prepare("SELECT * FROM media WHERE id_projet = ? ORDER BY ordre_affichage");
        $stmt->execute([$projetId]);
        return $stmt->fetchAll();
    }
}
