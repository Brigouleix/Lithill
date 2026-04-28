<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Utilisateur;
use App\Models\Commentaire;
use App\Models\LogAudit;
use App\Models\Session;

class AdminController extends Controller
{
    public function users(): void
    {
        $this->requireRole('admin');
        $p = $this->paginate($_GET);
        $this->json(['data' => Utilisateur::paginate($p['offset'], $p['limit'], $_GET['q'] ?? ''), 'page' => $p['page']]);
    }

    public function banUser(string $id): void
    {
        $admin = $this->requireRole('admin');
        $user  = Utilisateur::find((int)$id);
        if (!$user) $this->error(404, 'Utilisateur introuvable');
        if ($user['role'] === 'admin') $this->error(403, 'Impossible de bannir un admin');

        Utilisateur::update((int)$id, ['statut' => 'banni']);
        Session::revokeAll((int)$id);
        LogAudit::log('BAN_USER', $admin['id_utilisateur'], ['target' => $id]);
        $this->json(['message' => 'Utilisateur banni']);
    }

    public function unbanUser(string $id): void
    {
        $admin = $this->requireRole('admin');
        $user  = Utilisateur::find((int)$id);
        if (!$user) $this->error(404, 'Utilisateur introuvable');

        Utilisateur::update((int)$id, ['statut' => 'actif']);
        LogAudit::log('UNBAN_USER', $admin['id_utilisateur'], ['target' => $id]);
        $this->json(['message' => 'Utilisateur réactivé']);
    }

    public function commentsSignales(): void
    {
        $this->requireRole('admin');
        $p = $this->paginate($_GET);
        $this->json(['data' => Commentaire::signales($p['offset'], $p['limit']), 'page' => $p['page']]);
    }

    public function moderateComment(string $id): void
    {
        $admin  = $this->requireRole('admin');
        $c      = Commentaire::find((int)$id);
        if (!$c) $this->error(404, 'Commentaire introuvable');

        $data   = $this->body();
        $statut = in_array($data['statut'] ?? '', ['publie', 'supprime']) ? $data['statut'] : 'supprime';
        Commentaire::update((int)$id, ['statut' => $statut]);
        LogAudit::log('MODERATE_COMMENT', $admin['id_utilisateur'], ['id' => $id, 'statut' => $statut]);
        $this->json(['message' => 'Commentaire modéré']);
    }

    public function logs(): void
    {
        $this->requireRole('admin');
        $limit = min(200, (int)($_GET['limit'] ?? 100));
        $this->json(LogAudit::recent($limit));
    }

    public function stats(): void
    {
        $this->requireRole('admin');
        $db = \Database::getInstance();
        $this->json([
            'utilisateurs' => (int) $db->query("SELECT COUNT(*) FROM utilisateur")->fetchColumn(),
            'portfolios'   => (int) $db->query("SELECT COUNT(*) FROM portfolio")->fetchColumn(),
            'projets'      => (int) $db->query("SELECT COUNT(*) FROM projet WHERE statut='publie'")->fetchColumn(),
            'signalements' => (int) $db->query("SELECT COUNT(*) FROM commentaire WHERE statut='signale'")->fetchColumn(),
        ]);
    }
}
