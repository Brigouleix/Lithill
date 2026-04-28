<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\LogAudit;
use Database;

class AmitieController extends Controller
{
    public function search(): void
    {
        $this->requireAuth();
        $q = trim($_GET['q'] ?? '');
        if (strlen($q) < 2) $this->json([]);

        $db   = Database::getInstance();
        $me   = Auth::id();
        $stmt = $db->prepare(
            "SELECT id_utilisateur, pseudo, avatar, bio
             FROM utilisateur
             WHERE (pseudo LIKE ? OR email LIKE ?)
               AND id_utilisateur != ?
               AND statut = 'actif'
             LIMIT 20"
        );
        $stmt->execute(["%{$q}%", "%{$q}%", $me]);
        $users = $stmt->fetchAll();

        // Enrichir avec le statut d'amitié existant
        foreach ($users as &$u) {
            $s = $db->prepare(
                "SELECT statut, id_demandeur FROM amitie
                 WHERE (id_demandeur = ? AND id_recepteur = ?)
                    OR (id_demandeur = ? AND id_recepteur = ?)
                 LIMIT 1"
            );
            $s->execute([$me, $u['id_utilisateur'], $u['id_utilisateur'], $me]);
            $rel = $s->fetch();
            $u['relation'] = $rel
                ? ($rel['statut'] === 'accepte' ? 'ami'
                    : ($rel['id_demandeur'] == $me ? 'demande_envoyee' : 'demande_recue'))
                : 'aucune';
        }

        $this->json($users);
    }

    public function envoyer(): void
    {
        $user = $this->requireAuth();
        $data = $this->body();
        $cible = (int)($data['id_utilisateur'] ?? 0);
        if (!$cible || $cible === $user['id_utilisateur']) $this->error(400, 'Cible invalide');

        $db = Database::getInstance();

        // Vérifier qu'aucune relation n'existe déjà
        $s = $db->prepare(
            "SELECT id_amitie FROM amitie
             WHERE (id_demandeur = ? AND id_recepteur = ?)
                OR (id_demandeur = ? AND id_recepteur = ?)"
        );
        $s->execute([$user['id_utilisateur'], $cible, $cible, $user['id_utilisateur']]);
        if ($s->fetch()) $this->error(409, 'Une relation existe déjà');

        $db->prepare("INSERT INTO amitie (id_demandeur, id_recepteur) VALUES (?, ?)")
           ->execute([$user['id_utilisateur'], $cible]);

        LogAudit::log('FRIEND_REQUEST', $user['id_utilisateur'], ['target' => $cible]);
        $this->json(['message' => 'Demande envoyée'], 201);
    }

    public function repondre(string $id): void
    {
        $user   = $this->requireAuth();
        $data   = $this->body();
        $statut = in_array($data['statut'] ?? '', ['accepte', 'refuse']) ? $data['statut'] : null;
        if (!$statut) $this->error(400, 'Statut invalide');

        $db = Database::getInstance();
        $s  = $db->prepare("SELECT * FROM amitie WHERE id_amitie = ? AND id_recepteur = ?");
        $s->execute([$id, $user['id_utilisateur']]);
        $amitie = $s->fetch();
        if (!$amitie) $this->error(404, 'Demande introuvable');

        $db->prepare("UPDATE amitie SET statut = ? WHERE id_amitie = ?")
           ->execute([$statut, $id]);

        LogAudit::log('FRIEND_' . strtoupper($statut), $user['id_utilisateur'], ['amitie' => $id]);
        $this->json(['message' => $statut === 'accepte' ? 'Ami ajouté' : 'Demande refusée']);
    }

    public function supprimer(string $id): void
    {
        $user = $this->requireAuth();
        $db   = Database::getInstance();
        $db->prepare(
            "DELETE FROM amitie WHERE id_amitie = ?
             AND (id_demandeur = ? OR id_recepteur = ?)"
        )->execute([$id, $user['id_utilisateur'], $user['id_utilisateur']]);
        $this->json(['message' => 'Ami retiré']);
    }

    public function liste(): void
    {
        $user = $this->requireAuth();
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT u.id_utilisateur, u.pseudo, u.avatar, u.bio,
                    a.id_amitie, a.statut, a.id_demandeur
             FROM amitie a
             JOIN utilisateur u ON u.id_utilisateur =
                CASE WHEN a.id_demandeur = ? THEN a.id_recepteur ELSE a.id_demandeur END
             WHERE (a.id_demandeur = ? OR a.id_recepteur = ?)
               AND a.statut = 'accepte'
             ORDER BY u.pseudo"
        );
        $stmt->execute(array_fill(0, 3, $user['id_utilisateur']));
        $this->json($stmt->fetchAll());
    }

    public function demandesRecues(): void
    {
        $user = $this->requireAuth();
        $db   = Database::getInstance();
        $stmt = $db->prepare(
            "SELECT a.id_amitie, a.date_demande,
                    u.id_utilisateur, u.pseudo, u.avatar
             FROM amitie a
             JOIN utilisateur u ON u.id_utilisateur = a.id_demandeur
             WHERE a.id_recepteur = ? AND a.statut = 'en_attente'
             ORDER BY a.date_demande DESC"
        );
        $stmt->execute([$user['id_utilisateur']]);
        $this->json($stmt->fetchAll());
    }
}
