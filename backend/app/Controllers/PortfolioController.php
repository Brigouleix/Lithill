<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\Portfolio;
use App\Models\Projet;
use App\Utils\Security;
use App\Utils\Validator;
use App\Utils\FileUpload;

class PortfolioController extends Controller
{
    public function index(): void
    {
        $p    = $this->paginate($_GET);
        $list = Portfolio::listPublic($p['offset'], $p['limit'], $_GET['q'] ?? '');
        $this->json(['data' => $list, 'page' => $p['page'], 'limit' => $p['limit']]);
    }

    public function show(string $slug): void
    {
        $portfolio = Portfolio::findBySlugWithUser($slug);

        // Fallback : le slug peut être un pseudo utilisateur
        if (!$portfolio) {
            $portfolio = Portfolio::findFirstByUserPseudo($slug);
        }

        if (!$portfolio) $this->error(404, 'Portfolio introuvable');

        $viewer  = Auth::user();
        $isOwner = $viewer && $viewer['id_utilisateur'] === $portfolio['id_utilisateur'];

        if ($portfolio['visibilite'] === 'prive' && !$isOwner) $this->error(403, 'Portfolio privé');

        $portfolio['projets'] = Projet::findByPortfolio($portfolio['id_portfolio'], !$isOwner);
        $this->json($portfolio);
    }

    public function byUser(string $pseudo): void
    {
        $portfolios = Portfolio::listByUserPseudo($pseudo);
        $this->json($portfolios);
    }

    public function uploadCouverture(string $slug): void
    {
        $user      = $this->requireAuth();
        $portfolio = Portfolio::findBySlug($slug);
        if (!$portfolio) $this->error(404, 'Portfolio introuvable');
        if ($portfolio['id_utilisateur'] !== $user['id_utilisateur']) $this->error(403, 'Interdit');
        if (empty($_FILES['couverture'])) $this->error(400, 'Aucun fichier');
        try {
            $result = FileUpload::handle($_FILES['couverture'], 'couvertures');
            if (!empty($portfolio['image_couverture'])) FileUpload::delete($portfolio['image_couverture']);
            Portfolio::update($portfolio['id_portfolio'], ['image_couverture' => $result['url_stockage']]);
            $this->json(['image_couverture' => $result['url_stockage']]);
        } catch (\RuntimeException $e) { $this->error(400, $e->getMessage()); }
    }

    public function miens(): void
    {
        $user = $this->requireAuth();
        $this->json(Portfolio::listByUser($user['id_utilisateur']));
    }

    public function destroy(string $slug): void
    {
        $user      = $this->requireAuth();
        $portfolio = Portfolio::findBySlug($slug);
        if (!$portfolio) $this->error(404, 'Album introuvable');
        if ($portfolio['id_utilisateur'] !== $user['id_utilisateur'] && $user['role'] !== 'admin') $this->error(403, 'Interdit');
        Portfolio::delete($portfolio['id_portfolio']);
        $this->json(['message' => 'Album supprimé']);
    }

    public function store(): void
    {
        $user = $this->requireAuth();

        $data = $this->body();
        $v    = (new Validator($data))->required('titre', 'Titre')->maxLength('titre', 255)->maxLength('description', 2000);
        if ($v->fails()) $this->json(['errors' => $v->errors()], 422);

        $slug = Security::uniqueSlug($data['titre'], fn($s) => Portfolio::findBySlug($s));
        $id   = Portfolio::insert([
            'id_utilisateur' => $user['id_utilisateur'],
            'titre'          => Security::sanitize($data['titre']),
            'description'    => Security::sanitize($data['description'] ?? ''),
            'slug'           => $slug,
            'visibilite'     => in_array($data['visibilite'] ?? '', ['public', 'prive']) ? $data['visibilite'] : 'public',
        ]);

        $this->json(Portfolio::find($id), 201);
    }

    public function update(string $slug): void
    {
        $user      = $this->requireAuth();
        $portfolio = Portfolio::findBySlug($slug);
        if (!$portfolio) $this->error(404, 'Portfolio introuvable');
        if ($portfolio['id_utilisateur'] !== $user['id_utilisateur'] && $user['role'] !== 'admin') $this->error(403, 'Interdit');

        $data   = $this->body();
        $update = [];
        if (isset($data['titre']))       $update['titre']       = Security::sanitize($data['titre']);
        if (isset($data['description'])) $update['description'] = Security::sanitize($data['description']);
        if (isset($data['visibilite']) && in_array($data['visibilite'], ['public', 'prive'])) {
            $update['visibilite'] = $data['visibilite'];
        }
        if ($update) Portfolio::update($portfolio['id_portfolio'], $update);

        $this->json(Portfolio::find($portfolio['id_portfolio']));
    }
}
