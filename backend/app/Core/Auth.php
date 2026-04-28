<?php
namespace App\Core;

use App\Models\Session;
use App\Models\Utilisateur;

class Auth
{
    private static ?array $current = null;

    public static function user(): ?array
    {
        if (self::$current !== null) return self::$current;

        $token = self::extractToken();
        if (!$token) return null;

        $session = Session::findActive($token);
        if (!$session) return null;

        $user = Utilisateur::find($session['id_utilisateur']);
        if (!$user || $user['statut'] !== 'actif') return null;

        self::$current = $user;
        return $user;
    }

    public static function id(): ?int
    {
        return self::user()['id_utilisateur'] ?? null;
    }

    private static function extractToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }
}
