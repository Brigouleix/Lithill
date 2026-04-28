<?php
namespace App\Utils;

class Security
{
    public static function setHeaders(): void
    {
        $origin = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;");
        if (($_ENV['APP_ENV'] ?? '') === 'production') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }
    }

    public static function sanitize(string $value): string
    {
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public static function slug(string $text): string
    {
        $map  = ['é'=>'e','è'=>'e','ê'=>'e','ë'=>'e','à'=>'a','â'=>'a','ä'=>'a',
                 'ù'=>'u','û'=>'u','ü'=>'u','î'=>'i','ï'=>'i','ô'=>'o','ö'=>'o','ç'=>'c'];
        $text = mb_strtolower(strtr($text, $map), 'UTF-8');
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        return trim($text, '-');
    }

    public static function uniqueSlug(string $base, callable $exists): string
    {
        $slug = self::slug($base);
        $try  = $slug;
        $i    = 2;
        while ($exists($try)) { $try = "{$slug}-{$i}"; $i++; }
        return $try;
    }
}
