<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use Database;

class AbonnementController extends Controller
{
    public function suivre(string $userId): void
    {
        $user  = $this->requireAuth();
        $cible = (int)$userId;
        if ($cible === $user['id_utilisateur']) $this->error(400, 'Vous ne pouvez pas vous suivre');

        $db = Database::getInstance();
        $s  = $db->prepare("SELECT 1 FROM abonnement WHERE id_abonne = ? AND id_suivi = ?");
        $s->execute([$user['id_utilisateur'], $cible]);

        if ($s->fetch()) {
            $db->prepare("DELETE FROM abonnement WHERE id_abonne = ? AND id_suivi = ?")
               ->execute([$user['id_utilisateur'], $cible]);
            $this->json(['suivi' => false]);
        } else {
            $db->prepare("INSERT INTO abonnement (id_abonne, id_suivi) VALUES (?, ?)")
               ->execute([$user['id_utilisateur'], $cible]);
            $this->json(['suivi' => true]);
        }
    }

    public function abonnements(): void
    {
        $user = $this->requireAuth();
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT u.id_utilisateur, u.pseudo, u.avatar, u.bio,
                    p.slug AS portfolio_slug, p.titre AS portfolio_titre
             FROM abonnement a
             JOIN utilisateur u ON u.id_utilisateur = a.id_suivi
             LEFT JOIN portfolio p ON p.id_utilisateur = u.id_utilisateur
             WHERE a.id_abonne = ?
             ORDER BY u.pseudo"
        );
        $stmt->execute([$user['id_utilisateur']]);
        $this->json($stmt->fetchAll());
    }

    public function abonnes(): void
    {
        $user = $this->requireAuth();
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT u.id_utilisateur, u.pseudo, u.avatar
             FROM abonnement a
             JOIN utilisateur u ON u.id_utilisateur = a.id_abonne
             WHERE a.id_suivi = ?
             ORDER BY u.pseudo"
        );
        $stmt->execute([$user['id_utilisateur']]);
        $this->json($stmt->fetchAll());
    }

    public function galerie(): void
    {
        $user = $this->requireAuth();
        $p    = $this->paginate($_GET);
        $db   = Database::getInstance();

        // Projets des amis + des suivis, publiés, non dupliqués
        $stmt = $db->prepare(
            "SELECT DISTINCT pr.*, u.pseudo, po.slug AS portfolio_slug,
                    COUNT(DISTINCT l.id_utilisateur) AS nb_likes
             FROM projet pr
             JOIN portfolio po ON po.id_portfolio = pr.id_portfolio
             JOIN utilisateur u ON u.id_utilisateur = po.id_utilisateur
             LEFT JOIN like_projet l ON l.id_projet = pr.id_projet
             WHERE pr.statut = 'publie'
               AND (
                 po.id_utilisateur IN (
                   SELECT CASE WHEN id_demandeur = ? THEN id_recepteur ELSE id_demandeur END
                   FROM amitie WHERE (id_demandeur = ? OR id_recepteur = ?) AND statut = 'accepte'
                 )
                 OR
                 po.id_utilisateur IN (
                   SELECT id_suivi FROM abonnement WHERE id_abonne = ?
                 )
               )
             GROUP BY pr.id_projet
             ORDER BY pr.date_publication DESC
             LIMIT ? OFFSET ?",
        );
        $me = $user['id_utilisateur'];
        $stmt->execute([$me, $me, $me, $me, $p['limit'], $p['offset']]);
        $projets = $stmt->fetchAll();

        // Ajouter le premier média de chaque projet
        foreach ($projets as &$proj) {
            $s = $db->prepare("SELECT url_stockage FROM media WHERE id_projet = ? ORDER BY ordre_affichage LIMIT 1");
            $s->execute([$proj['id_projet']]);
            $proj['media'] = $s->fetchColumn() ?: null;
        }

        $this->json(['data' => $projets, 'page' => $p['page']]);
    }
}
