<?php
namespace App\Middleware;

class RateLimitMiddleware
{
    private static string $dir = __DIR__ . '/../../../storage/rate_limit/';

    public static function check(string $key, int $max = MAX_LOGIN_ATTEMPTS, int $window = RATE_LIMIT_WINDOW): void
    {
        if (!is_dir(self::$dir)) mkdir(self::$dir, 0700, true);

        $file = self::$dir . md5($key) . '.json';
        $now  = time();
        $data = ['count' => 0, 'reset_at' => $now + $window];

        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true);
            if ($now > $data['reset_at']) {
                $data = ['count' => 0, 'reset_at' => $now + $window];
            }
        }

        $data['count']++;
        file_put_contents($file, json_encode($data));

        if ($data['count'] > $max) {
            $retry = $data['reset_at'] - $now;
            http_response_code(429);
            header("Retry-After: {$retry}");
            header('Content-Type: application/json');
            echo json_encode(['error' => "Trop de tentatives. Réessayez dans {$retry}s."]);
            exit;
        }
    }

    public static function reset(string $key): void
    {
        $file = self::$dir . md5($key) . '.json';
        if (file_exists($file)) unlink($file);
    }
}
