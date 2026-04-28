<?php
namespace App\Middleware;

use App\Core\Auth;

class AuthMiddleware
{
    public static function handle(): void
    {
        if (!Auth::user()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Authentification requise']);
            exit;
        }
    }

    public static function handleRole(string ...$roles): void
    {
        self::handle();
        $user = Auth::user();
        if (!in_array($user['role'], $roles, true)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Accès interdit']);
            exit;
        }
    }
}
