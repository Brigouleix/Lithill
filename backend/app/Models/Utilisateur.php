<?php
namespace App\Models;

class Utilisateur extends Model
{
    protected static string $table = 'utilisateur';
    protected static string $pk    = 'id_utilisateur';

    public static function findByEmail(string $email): ?array
    {
        return static::findBy('email', $email);
    }

    public static function findByPseudo(string $pseudo): ?array
    {
        return static::findBy('pseudo', $pseudo);
    }

    public static function create(array $data): int
    {
        $data['mot_de_passe'] = password_hash($data['mot_de_passe'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
        $data['statut']       = 'en_attente';
        return static::insert($data);
    }

    public static function verify(string $email, string $password): ?array
    {
        $user = static::findByEmail($email);
        if (!$user) return null;
        if (!password_verify($password, $user['mot_de_passe'])) return null;
        return $user;
    }

    public static function paginate(int $offset, int $limit, string $search = ''): array
    {
        $sql    = "SELECT id_utilisateur, pseudo, email, role, statut, date_inscription FROM utilisateur";
        $params = [];
        if ($search !== '') {
            $sql   .= " WHERE pseudo LIKE ? OR email LIKE ?";
            $params = ["%{$search}%", "%{$search}%"];
        }
        $sql     .= " ORDER BY date_inscription DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $stmt     = static::db()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function safeData(array $user): array
    {
        unset($user['mot_de_passe']);
        return $user;
    }
}
