<?php
namespace App\Controllers;

use App\Core\Controller;

class CategorieController extends Controller
{
    public function index(): void
    {
        $stmt = \Database::getInstance()->query("SELECT * FROM categorie ORDER BY nom");
        $this->json($stmt->fetchAll());
    }

    public function tags(): void
    {
        $stmt = \Database::getInstance()->query("SELECT * FROM tag ORDER BY nom");
        $this->json($stmt->fetchAll());
    }
}
