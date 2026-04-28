<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\Projet;
use App\Models\Portfolio;
use App\Utils\Security;
use App\Utils\Validator;

class ProjetController extends Controller
{
    public function index(): void
    {
        $p       = $this->paginate($_GET);
        $filters = array_intersect_key($_GET, array_flip(['q', 'categorie', 'tag']));
        $this->json(['data' => Projet::search($p['offset'], $p['limit'], $filters), 'page' => $p['page']]);
    }

    public function show(string $slug): void
    {
        $projet = Projet::findBySlug($slug);
        if (!$projet || $projet['statut'] !== 'publie') $this->error(404, 'Projet introuvable');
        Projet::incrementViews($projet['id_projet']);
        $this->json(Projet::withDetails($projet['id_projet']));
    }

    public function store(): void
    {
        $user = $this->requireAuth();
        $data = $this->body();

        if (!empty($data['portfolio_slug'])) {
            $portfolio = Portfolio::findBySlug($data['portfolio_slug']);
            if (!$portfolio || $portfolio['id_utilisateur'] !== $user['id_utilisateur']) {
                $this->error(403, 'Album introuvable ou non autorisé');
            }
        } else {
            $portfolios = Portfolio::listByUser($user['id_utilisateur']);
            $portfolio  = $portfolios[0] ?? null;
            if (!$portfolio) $this->error(404, 'Créez d\'abord un album');
        }

        $v = (new Validator($data))->required('titre', 'Titre')->maxLength('titre', 255)->maxLength('description', 5000);
        if ($v->fails()) $this->json(['errors' => $v->errors()], 422);

        $statut = in_array($data['statut'] ?? '', ['publie', 'brouillon']) ? $data['statut'] : 'brouillon';
        $slug   = Security::uniqueSlug($data['titre'], fn($s) => Projet::findBySlug($s));
        $id     = Projet::insert([
            'id_portfolio'     => $portfolio['id_portfolio'],
            'titre'            => Security::sanitize($data['titre']),
            'description'      => Security::sanitize($data['description'] ?? ''),
            'slug'             => $slug,
            'statut'           => $statut,
            'date_publication' => $statut === 'publie' ? date('Y-m-d H:i:s') : null,
        ]);

        $this->syncTags($id, $data['tags'] ?? []);
        $this->syncCategories($id, $data['categories'] ?? []);
        $this->json(Projet::withDetails($id), 201);
    }

    public function update(string $slug): void
    {
        $user   = $this->requireAuth();
        $projet = Projet::findBySlug($slug);
        if (!$projet) $this->error(404, 'Projet introuvable');

        $portfolio = Portfolio::find($projet['id_portfolio']);
        if ($portfolio['id_utilisateur'] !== $user['id_utilisateur'] && $user['role'] !== 'admin') $this->error(403, 'Interdit');

        $data = $this->body();
        $upd  = [];
        if (isset($data['titre']))       $upd['titre']       = Security::sanitize($data['titre']);
        if (isset($data['description'])) $upd['description'] = Security::sanitize($data['description']);
        if (isset($data['statut']) && in_array($data['statut'], ['publie', 'brouillon', 'archive'])) {
            $upd['statut'] = $data['statut'];
            if ($data['statut'] === 'publie' && !$projet['date_publication']) {
                $upd['date_publication'] = date('Y-m-d H:i:s');
            }
        }
        if ($upd) Projet::update($projet['id_projet'], $upd);
        if (isset($data['tags']))       $this->syncTags($projet['id_projet'], $data['tags']);
        if (isset($data['categories'])) $this->syncCategories($projet['id_projet'], $data['categories']);

        $this->json(Projet::withDetails($projet['id_projet']));
    }

    public function destroy(string $slug): void
    {
        $user   = $this->requireAuth();
        $projet = Projet::findBySlug($slug);
        if (!$projet) $this->error(404, 'Projet introuvable');

        $portfolio = Portfolio::find($projet['id_portfolio']);
        if ($portfolio['id_utilisateur'] !== $user['id_utilisateur'] && $user['role'] !== 'admin') $this->error(403, 'Interdit');

        Projet::delete($projet['id_projet']);
        $this->json(['message' => 'Projet supprimé']);
    }

    public function like(string $slug): void
    {
        $user   = $this->requireRole('createur', 'admin');
        $projet = Projet::findBySlug($slug);
        if (!$projet) $this->error(404, 'Projet introuvable');

        $db   = \Database::getInstance();
        $stmt = $db->prepare("SELECT 1 FROM like_projet WHERE id_utilisateur = ? AND id_projet = ?");
        $stmt->execute([$user['id_utilisateur'], $projet['id_projet']]);

        if ($stmt->fetch()) {
            $db->prepare("DELETE FROM like_projet WHERE id_utilisateur = ? AND id_projet = ?")->execute([$user['id_utilisateur'], $projet['id_projet']]);
            $this->json(['liked' => false]);
        } else {
            $db->prepare("INSERT INTO like_projet (id_utilisateur, id_projet) VALUES (?, ?)")->execute([$user['id_utilisateur'], $projet['id_projet']]);
            $this->json(['liked' => true]);
        }
    }

    private function syncTags(int $id, array $tags): void
    {
        $db = \Database::getInstance();
        $db->prepare("DELETE FROM projet_tag WHERE id_projet = ?")->execute([$id]);
        foreach ($tags as $t) $db->prepare("INSERT IGNORE INTO projet_tag (id_projet, id_tag) VALUES (?,?)")->execute([$id, (int)$t]);
    }

    private function syncCategories(int $id, array $cats): void
    {
        $db = \Database::getInstance();
        $db->prepare("DELETE FROM projet_categorie WHERE id_projet = ?")->execute([$id]);
        foreach ($cats as $c) $db->prepare("INSERT IGNORE INTO projet_categorie (id_projet, id_categorie) VALUES (?,?)")->execute([$id, (int)$c]);
    }
}
