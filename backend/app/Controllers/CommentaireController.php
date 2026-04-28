<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Commentaire;
use App\Models\Projet;
use App\Models\LogAudit;
use App\Utils\Security;
use App\Utils\Validator;

class CommentaireController extends Controller
{
    public function index(string $projetSlug): void
    {
        $projet = Projet::findBySlug($projetSlug);
        if (!$projet) $this->error(404, 'Projet introuvable');
        $this->json(Commentaire::forProjet($projet['id_projet']));
    }

    public function store(string $projetSlug): void
    {
        $user   = $this->requireRole('createur', 'admin');
        $projet = Projet::findBySlug($projetSlug);
        if (!$projet || $projet['statut'] !== 'publie') $this->error(404, 'Projet introuvable');

        $data = $this->body();
        $v    = (new Validator($data))->required('contenu', 'Commentaire')->maxLength('contenu', 1000);
        if ($v->fails()) $this->json(['errors' => $v->errors()], 422);

        $id = Commentaire::insert([
            'id_projet'      => $projet['id_projet'],
            'id_utilisateur' => $user['id_utilisateur'],
            'contenu'        => Security::sanitize($data['contenu']),
        ]);

        $this->json(Commentaire::find($id), 201);
    }

    public function signaler(string $id): void
    {
        $this->requireAuth();
        $c = Commentaire::find((int)$id);
        if (!$c) $this->error(404, 'Commentaire introuvable');
        Commentaire::update((int)$id, ['statut' => 'signale']);
        $this->json(['message' => 'Commentaire signalé']);
    }

    public function destroy(string $id): void
    {
        $user = $this->requireAuth();
        $c    = Commentaire::find((int)$id);
        if (!$c) $this->error(404, 'Commentaire introuvable');
        if ($c['id_utilisateur'] !== $user['id_utilisateur'] && $user['role'] !== 'admin') $this->error(403, 'Interdit');

        Commentaire::delete((int)$id);
        LogAudit::log('DELETE_COMMENT', $user['id_utilisateur'], ['id' => $id]);
        $this->json(['message' => 'Commentaire supprimé']);
    }
}
