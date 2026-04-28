<?php
namespace App\Controllers;

use App\Core\Controller;

class StatsController extends Controller
{
    public function miens(): void
    {
        $user = $this->requireAuth();
        $uid  = $user['id_utilisateur'];
        $db   = \Database::getInstance();

        // Global totals
        $stmt = $db->prepare("
            SELECT
                COUNT(DISTINCT pr.id_projet)  AS nb_projets,
                COALESCE(SUM(pr.nb_vues), 0)  AS nb_vues,
                COUNT(rm.id_media)             AS nb_reactions
            FROM projet pr
            JOIN portfolio p  ON p.id_portfolio  = pr.id_portfolio
            LEFT JOIN media m ON m.id_projet      = pr.id_projet
            LEFT JOIN reaction_media rm ON rm.id_media = m.id_media
            WHERE p.id_utilisateur = ?
        ");
        $stmt->execute([$uid]);
        $globals = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Reactions by type globally
        $stmt = $db->prepare("
            SELECT rm.type, COUNT(*) AS total
            FROM reaction_media rm
            JOIN media m   ON m.id_media    = rm.id_media
            JOIN projet pr ON pr.id_projet  = m.id_projet
            JOIN portfolio p ON p.id_portfolio = pr.id_portfolio
            WHERE p.id_utilisateur = ?
            GROUP BY rm.type
        ");
        $stmt->execute([$uid]);
        $reactionsGlobal = [];
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $reactionsGlobal[$row['type']] = (int) $row['total'];
        }

        // Per-project breakdown
        $stmt = $db->prepare("
            SELECT
                pr.id_projet,
                pr.titre,
                pr.slug,
                pr.statut,
                pr.date_creation,
                pr.nb_vues,
                (SELECT m2.url_stockage
                 FROM media m2
                 WHERE m2.id_projet = pr.id_projet
                 ORDER BY m2.ordre_affichage ASC LIMIT 1) AS thumbnail,
                COALESCE(SUM(CASE WHEN rm.type = 'like'    THEN 1 ELSE 0 END), 0) AS r_like,
                COALESCE(SUM(CASE WHEN rm.type = 'spot'    THEN 1 ELSE 0 END), 0) AS r_spot,
                COALESCE(SUM(CASE WHEN rm.type = 'palette' THEN 1 ELSE 0 END), 0) AS r_palette,
                COALESCE(SUM(CASE WHEN rm.type = 'lieu'    THEN 1 ELSE 0 END), 0) AS r_lieu,
                COUNT(rm.id_media)                                                 AS r_total
            FROM projet pr
            JOIN portfolio p  ON p.id_portfolio  = pr.id_portfolio
            LEFT JOIN media m ON m.id_projet      = pr.id_projet
            LEFT JOIN reaction_media rm ON rm.id_media = m.id_media
            WHERE p.id_utilisateur = ?
            GROUP BY pr.id_projet, pr.titre, pr.slug, pr.statut, pr.date_creation, pr.nb_vues
            ORDER BY pr.date_creation DESC
        ");
        $stmt->execute([$uid]);
        $projets = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($projets as &$p) {
            $p['nb_vues']   = (int) $p['nb_vues'];
            $p['r_like']    = (int) $p['r_like'];
            $p['r_spot']    = (int) $p['r_spot'];
            $p['r_palette'] = (int) $p['r_palette'];
            $p['r_lieu']    = (int) $p['r_lieu'];
            $p['r_total']   = (int) $p['r_total'];
        }
        unset($p);

        $this->json([
            'global' => [
                'nb_projets'   => (int) $globals['nb_projets'],
                'nb_vues'      => (int) $globals['nb_vues'],
                'nb_reactions' => (int) $globals['nb_reactions'],
            ],
            'reactions_global' => $reactionsGlobal,
            'projets'          => $projets,
        ]);
    }
}
