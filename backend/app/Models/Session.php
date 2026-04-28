<?php
namespace App\Models;

class Session extends Model
{
    protected static string $table = 'session';
    protected static string $pk    = 'id_session';

    public static function create(int $userId): string
    {
        $token   = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
        static::insert([
            'id_utilisateur'  => $userId,
            'token'           => $token,
            'ip_adresse'      => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
            'user_agent'      => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'date_expiration' => $expires,
            'est_active'      => 1,
        ]);
        return $token;
    }

    public static function findActive(string $token): ?array
    {
        $stmt = static::db()->prepare(
            "SELECT * FROM session WHERE token = ? AND est_active = 1 AND date_expiration > NOW() LIMIT 1"
        );
        $stmt->execute([$token]);
        return $stmt->fetch() ?: null;
    }

    public static function revoke(string $token): void
    {
        static::db()->prepare("UPDATE session SET est_active = 0 WHERE token = ?")->execute([$token]);
    }

    public static function revokeAll(int $userId): void
    {
        static::db()->prepare("UPDATE session SET est_active = 0 WHERE id_utilisateur = ?")->execute([$userId]);
    }
}
