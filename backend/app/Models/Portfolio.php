<?php
namespace App\Models;

class Portfolio extends Model
{
    protected static string $table = 'portfolio';
    protected static string $pk    = 'id_portfolio';

    public static function findByUser(int $userId): ?array
    {
        return static::findBy('id_utilisateur', $userId);
    }

    public static function listByUser(int $userId): array
    {
        $sql = "SELECT p.*,
                       COUNT(DISTINCT pr.id_projet) AS nb_projets,
                       (SELECT m.url_stockage FROM media m
                        JOIN projet pr2 ON pr2.id_projet = m.id_projet
                        WHERE pr2.id_portfolio = p.id_portfolio
                        ORDER BY m.date_upload ASC LIMIT 1) AS thumbnail
                FROM portfolio p
                LEFT JOIN projet pr ON pr.id_portfolio = p.id_portfolio
                WHERE p.id_utilisateur = ?
                GROUP BY p.id_portfolio
                ORDER BY p.date_creation DESC";
        $stmt = static::db()->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function findBySlug(string $slug): ?array
    {
        return static::findBy('slug', $slug);
    }

    public static function findBySlugWithUser(string $slug): ?array
    {
        $sql  = "SELECT p.*, u.pseudo, u.avatar, u.bio, u.banniere, u.badge
                 FROM portfolio p
                 JOIN utilisateur u ON u.id_utilisateur = p.id_utilisateur
                 WHERE p.slug = ? LIMIT 1";
        $stmt = static::db()->prepare($sql);
        $stmt->execute([$slug]);
        return $stmt->fetch() ?: null;
    }

    public static function findFirstByUserPseudo(string $pseudo): ?array
    {
        $sql  = "SELECT p.*, u.pseudo, u.avatar, u.bio, u.banniere, u.badge
                 FROM portfolio p
                 JOIN utilisateur u ON u.id_utilisateur = p.id_utilisateur
                 WHERE u.pseudo = ?
                 ORDER BY p.date_creation ASC
                 LIMIT 1";
        $stmt = static::db()->prepare($sql);
        $stmt->execute([$pseudo]);
        return $stmt->fetch() ?: null;
    }

    public static function listByUserPseudo(string $pseudo): array
    {
        $sql  = "SELECT p.*, COUNT(DISTINCT pr.id_projet) AS nb_projets
                 FROM portfolio p
                 JOIN utilisateur u ON u.id_utilisateur = p.id_utilisateur
                 LEFT JOIN projet pr ON pr.id_portfolio = p.id_portfolio AND pr.statut = 'publie'
                 WHERE u.pseudo = ? AND p.visibilite = 'public'
                 GROUP BY p.id_portfolio
                 ORDER BY p.date_creation ASC";
        $stmt = static::db()->prepare($sql);
        $stmt->execute([$pseudo]);
        return $stmt->fetchAll();
    }

    public static function listPublic(int $offset, int $limit, string $search = ''): array
    {
        $sql    = "SELECT p.*, u.pseudo, u.avatar,
                          COUNT(DISTINCT pr.id_projet) AS nb_projets
                   FROM portfolio p
                   JOIN utilisateur u ON u.id_utilisateur = p.id_utilisateur
                   LEFT JOIN projet pr ON pr.id_portfolio = p.id_portfolio AND pr.statut = 'publie'
                   WHERE p.visibilite = 'public'";
        $params = [];
        if ($search !== '') {
            $sql   .= " AND (p.titre LIKE ? OR u.pseudo LIKE ?)";
            $params = ["%{$search}%", "%{$search}%"];
        }
        $sql     .= " GROUP BY p.id_portfolio ORDER BY p.date_creation DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $stmt     = static::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
