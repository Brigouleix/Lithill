<?php
namespace App\Models;

use PDO;

abstract class Model
{
    protected static string $table = '';
    protected static string $pk    = 'id';

    protected static function db(): PDO
    {
        return \Database::getInstance();
    }

    public static function find(int $id): ?array
    {
        $t    = static::$table;
        $k    = static::$pk;
        $stmt = static::db()->prepare("SELECT * FROM `{$t}` WHERE `{$k}` = ? LIMIT 1");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findBy(string $col, mixed $value): ?array
    {
        $t    = static::$table;
        $stmt = static::db()->prepare("SELECT * FROM `{$t}` WHERE `{$col}` = ? LIMIT 1");
        $stmt->execute([$value]);
        return $stmt->fetch() ?: null;
    }

    public static function insert(array $data): int
    {
        $t    = static::$table;
        $cols = implode('`, `', array_keys($data));
        $ph   = implode(', ', array_fill(0, count($data), '?'));
        $stmt = static::db()->prepare("INSERT INTO `{$t}` (`{$cols}`) VALUES ({$ph})");
        $stmt->execute(array_values($data));
        return (int) static::db()->lastInsertId();
    }

    public static function update(int $id, array $data): void
    {
        $t    = static::$table;
        $k    = static::$pk;
        $set  = implode(', ', array_map(fn($c) => "`{$c}` = ?", array_keys($data)));
        $stmt = static::db()->prepare("UPDATE `{$t}` SET {$set} WHERE `{$k}` = ?");
        $stmt->execute([...array_values($data), $id]);
    }

    public static function delete(int $id): void
    {
        $t = static::$table;
        $k = static::$pk;
        static::db()->prepare("DELETE FROM `{$t}` WHERE `{$k}` = ?")->execute([$id]);
    }
}
