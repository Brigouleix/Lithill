<?php
declare(strict_types=1);

// Sécurité : désactiver l'affichage des erreurs en production
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use App\Core\Router;
use App\Utils\Security;

// Charger les variables d'environnement
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Constantes de sécurité
require_once __DIR__ . '/../config/security.php';

// Connexion BDD
require_once __DIR__ . '/../config/database.php';

// Headers de sécurité (CORS, CSP, etc.)
Security::setHeaders();

// Gestion de la requête OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Autoloader PSR-4 (au cas où Composer autoload n'est pas complet)
spl_autoload_register(function (string $class) {
    $base   = __DIR__ . '/../app/';
    $prefix = 'App\\';
    if (str_starts_with($class, $prefix)) {
        $file = $base . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (file_exists($file)) require_once $file;
    }
});

// Routeur
$router = new Router();
require_once __DIR__ . '/../routes/api.php';

// Gestion globale des exceptions
set_exception_handler(function (Throwable $e) {
    $env = $_ENV['APP_ENV'] ?? 'production';
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'Erreur interne du serveur',
        'details' => $env === 'development' ? $e->getMessage() : null,
    ]);
});

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
