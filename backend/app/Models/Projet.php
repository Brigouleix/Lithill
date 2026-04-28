<?php
namespace App\Models;

class Projet extends Model
{
    protected static string $table = 'projet';
    protected static string $pk    = 'id_projet';

    public static function findBySlug(string $slug): ?array
    {
        return static::findBy('slug', $slug);
    }

    public static function findByPortfolio(int $portfolioId, bool $publishedOnly = true): array
    {
        $sql    = "SELECT pr.*, COUNT(DISTINCT l.id_utilisateur) AS nb_likes
                   FROM projet pr
                   LEFT JOIN like_projet l ON l.id_projet = pr.id_projet
                   WHERE pr.id_portfolio = ?";
        $params = [$portfolioId];
        if ($publishedOnly) {
            $sql .= " AND pr.statut = 'publie'";
        }
        $sql .= " GROUP BY pr.id_projet ORDER BY pr.date_publication DESC";
        $stmt = static::db()->prepare($sql);
        $stmt->execute($params);
        $projets = $stmt->fetchAll();

        $db = static::db();
        foreach ($projets as &$p) {
            $s = $db->prepare("SELECT * FROM media WHERE id_projet = ? ORDER BY ordre_affichage LIMIT 6");
            $s->execute([$p['id_projet']]);
            $p['medias'] = $s->fetchAll();
        }
        return $projets;
    }

    public static function search(int $offset, int $limit, array $filters = []): array
    {
        $params = [];
        $where  = ["pr.statut = 'publie'"];

        if (!empty($filters['q'])) {
            $where[]  = "(pr.titre LIKE ? OR pr.description LIKE ?)";
            $params[] = "%{$filters['q']}%";
            $params[] = "%{$filters['q']}%";
        }
        if (!empty($filters['categorie'])) {
            $where[]  = "EXISTS (SELECT 1 FROM projet_categorie pc JOIN categorie c ON c.id_categorie = pc.id_categorie WHERE pc.id_projet = pr.id_projet AND c.slug = ?)";
            $params[] = $filters['categorie'];
        }
        if (!empty($filters['tag'])) {
            $where[]  = "EXISTS (SELECT 1 FROM projet_tag pt JOIN tag t ON t.id_tag = pt.id_tag WHERE pt.id_projet = pr.id_projet AND t.slug = ?)";
            $params[] = $filters['tag'];
        }

        $cond     = implode(' AND ', $where);
        $sql      = "SELECT pr.*, u.pseudo, u.badge, po.slug AS portfolio_slug,
                            COUNT(DISTINCT l.id_utilisateur) AS nb_likes,
                            (SELECT m.url_stockage FROM media m
                             WHERE m.id_projet = pr.id_projet
                             ORDER BY m.ordre_affichage ASC LIMIT 1) AS media
                     FROM projet pr
                     JOIN portfolio po ON po.id_portfolio = pr.id_portfolio
                     JOIN utilisateur u ON u.id_utilisateur = po.id_utilisateur
                     LEFT JOIN like_projet l ON l.id_projet = pr.id_projet
                     WHERE {$cond}
                     GROUP BY pr.id_projet
                     ORDER BY pr.date_publication DESC
                     LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $stmt     = static::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function incrementViews(int $id): void
    {
        static::db()->prepare("UPDATE projet SET nb_vues = nb_vues + 1 WHERE id_projet = ?")->execute([$id]);
    }

    public static function withDetails(int $id): ?array
    {
        $projet = static::find($id);
        if (!$projet) return null;

        $db = static::db();

        // Médias
        $s = $db->prepare("SELECT * FROM media WHERE id_projet = ? ORDER BY ordre_affichage");
        $s->execute([$id]);
        $medias = $s->fetchAll();

        if (!empty($medias)) {
            $mediaIds     = array_column($medias, 'id_media');
            $placeholders = implode(',', array_fill(0, count($mediaIds), '?'));

            // Totaux de réactions
            $s = $db->prepare("SELECT id_media, type, COUNT(*) AS total FROM reaction_media WHERE id_media IN ({$placeholders}) GROUP BY id_media, type");
            $s->execute($mediaIds);
            $reactionMap = [];
            foreach ($s->fetchAll() as $r) {
                $reactionMap[$r['id_media']][$r['type']] = (int) $r['total'];
            }

            // Réactions de l'utilisateur connecté
            $userReactionMap = [];
            $authUser = \App\Core\Auth::user();
            if ($authUser) {
                $s = $db->prepare("SELECT id_media, type FROM reaction_media WHERE id_utilisateur = ? AND id_media IN ({$placeholders})");
                $s->execute([$authUser['id_utilisateur'], ...$mediaIds]);
                foreach ($s->fetchAll() as $ur) {
                    $userReactionMap[$ur['id_media']][] = $ur['type'];
                }
            }

            foreach ($medias as &$m) {
                $base = ['like' => 0, 'spot' => 0, 'palette' => 0, 'lieu' => 0];
                $m['reactions']      = array_merge($base, $reactionMap[$m['id_media']] ?? []);
                $m['user_reactions'] = $userReactionMap[$m['id_media']] ?? [];
            }
        }
        $projet['medias'] = $medias;

        // Catégories
        $s = $db->prepare("SELECT c.* FROM categorie c JOIN projet_categorie pc ON pc.id_categorie = c.id_categorie WHERE pc.id_projet = ?");
        $s->execute([$id]);
        $projet['categories'] = $s->fetchAll();

        // Tags
        $s = $db->prepare("SELECT t.* FROM tag t JOIN projet_tag pt ON pt.id_tag = t.id_tag WHERE pt.id_projet = ?");
        $s->execute([$id]);
        $projet['tags'] = $s->fetchAll();

        // Propriétaire (pseudo, badge, portfolio_slug)
        $s = $db->prepare("SELECT u.pseudo, u.avatar, u.badge, po.slug AS portfolio_slug FROM portfolio po JOIN utilisateur u ON u.id_utilisateur = po.id_utilisateur WHERE po.id_portfolio = ?");
        $s->execute([$projet['id_portfolio']]);
        $owner = $s->fetch();
        if ($owner) {
            $projet['pseudo']         = $owner['pseudo'];
            $projet['avatar']         = $owner['avatar'];
            $projet['badge']          = $owner['badge'];
            $projet['portfolio_slug'] = $owner['portfolio_slug'];
        }

        return $projet;
    }
}
