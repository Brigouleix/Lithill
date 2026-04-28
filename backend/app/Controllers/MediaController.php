<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Models\Media;
use App\Models\Projet;
use App\Models\Portfolio;
use App\Models\LogAudit;
use App\Utils\FileUpload;

class MediaController extends Controller
{
    public function store(string $projetSlug): void
    {
        $user   = $this->requireAuth();
        $projet = Projet::findBySlug($projetSlug);
        if (!$projet) $this->error(404, 'Projet introuvable');

        $portfolio = Portfolio::find($projet['id_portfolio']);
        if ($portfolio['id_utilisateur'] !== $user['id_utilisateur']) $this->error(403, 'Interdit');
        if (empty($_FILES['media'])) $this->error(400, 'Aucun fichier envoyé');

        try {
            $info = FileUpload::handle($_FILES['media']);
        } catch (\RuntimeException $e) {
            $this->error(422, $e->getMessage());
        }

        $ordre = count(Media::forProjet($projet['id_projet']));
        $id    = Media::insert([
            'id_projet'       => $projet['id_projet'],
            'nom_fichier'     => $info['nom_fichier'],
            'url_stockage'    => $info['url_stockage'],
            'type_mime'       => $info['type_mime'],
            'taille_octets'   => $info['taille_octets'],
            'ordre_affichage' => $ordre,
        ]);

        LogAudit::log('UPLOAD_MEDIA', $user['id_utilisateur'], ['projet' => $projetSlug]);
        $this->json(Media::find($id), 201);
    }

    public function destroy(string $projetSlug, string $mediaId): void
    {
        $user   = $this->requireAuth();
        $projet = Projet::findBySlug($projetSlug);
        if (!$projet) $this->error(404, 'Projet introuvable');

        $portfolio = Portfolio::find($projet['id_portfolio']);
        if ($portfolio['id_utilisateur'] !== $user['id_utilisateur'] && $user['role'] !== 'admin') $this->error(403, 'Interdit');

        $media = Media::find((int)$mediaId);
        if (!$media || $media['id_projet'] !== $projet['id_projet']) $this->error(404, 'Média introuvable');

        FileUpload::delete($media['url_stockage']);
        Media::delete((int)$mediaId);
        $this->json(['message' => 'Média supprimé']);
    }
}
