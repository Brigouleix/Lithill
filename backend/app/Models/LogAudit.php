<?php
namespace App\Models;

class LogAudit extends Model
{
    protected static string $table = 'log_audit';
    protected static string $pk    = 'id_log';

    public static function log(string $action, ?int $userId = null, array $details = []): void
    {
        static::insert([
            'id_utilisateur' => $userId,
            'action'         => $action,
            'ip_adresse'     => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
            'user_agent'     => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'details'        => json_encode($details),
        ]);
    }

    public static function recent(int $limit = 100): array
    {
        $stmt = static::db()->prepare(
            "SELECT l.*, u.pseudo
             FROM log_audit l
             LEFT JOIN utilisateur u ON u.id_utilisateur = l.id_utilisateur
             ORDER BY l.date_action DESC LIMIT ?"
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
}
