<?php
namespace App\Middleware;

class CsrfMiddleware
{
    private const HEADER = 'HTTP_X_CSRF_TOKEN';
    private const COOKIE = 'csrf_token';

    public static function generate(): string
    {
        $token = bin2hex(random_bytes(CSRF_TOKEN_LENGTH));
        setcookie(self::COOKIE, $token, [
            'expires'  => time() + 3600,
            'path'     => '/',
            'secure'   => true,
            'httponly' => false,    // doit être lisible par JS pour l'envoyer en header
            'samesite' => 'Strict',
        ]);
        return $token;
    }

    public static function verify(): void
    {
        if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH', 'DELETE'], true)) return;

        $header = $_SERVER[self::HEADER] ?? '';
        $cookie = $_COOKIE[self::COOKIE] ?? '';

        if (!$header || !$cookie || !hash_equals($cookie, $header)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Token CSRF invalide']);
            exit;
        }
    }
}
