<?php
namespace App\Controllers;

use App\Core\Controller;

class ReactionController extends Controller
{
    public function react(string $mediaId): void
    {
        $user = $this->requireAuth();
        $data = $this->body();
        $type = $data['type'] ?? '';

        if (!in_array($type, ['like', 'spot', 'palette', 'lieu'], true)) {
            $this->error(400, 'Type de reaction invalide');
        }

        $id   = (int) $mediaId;
        $db   = \Database::getInstance();

        $stmt = $db->prepare("SELECT 1 FROM reaction_media WHERE id_utilisateur = ? AND id_media = ? AND type = ?");
        $stmt->execute([$user['id_utilisateur'], $id, $type]);

        if ($stmt->fetch()) {
            $db->prepare("DELETE FROM reaction_media WHERE id_utilisateur = ? AND id_media = ? AND type = ?")
               ->execute([$user['id_utilisateur'], $id, $type]);
            $this->json(['reacted' => false, 'type' => $type]);
        } else {
            $db->prepare("INSERT INTO reaction_media (id_utilisateur, id_media, type) VALUES (?, ?, ?)")
               ->execute([$user['id_utilisateur'], $id, $type]);
            $this->json(['reacted' => true, 'type' => $type]);
        }
    }
}
