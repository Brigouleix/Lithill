<?php
namespace App\Core;

abstract class Controller
{
    protected function json(mixed $data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    protected function error(int $code, string $message): void
    {
        $this->json(['error' => $message], $code);
    }

    protected function requireAuth(): array
    {
        $user = Auth::user();
        if (!$user) {
            $this->error(401, 'Authentification requise');
        }
        return $user;
    }

    protected function requireRole(string ...$roles): array
    {
        $user = $this->requireAuth();
        if (!in_array($user['role'], $roles, true)) {
            $this->error(403, 'Accès interdit');
        }
        return $user;
    }

    protected function body(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    protected function paginate(array $params): array
    {
        $page  = max(1, (int)($params['page'] ?? 1));
        $limit = min(50, max(1, (int)($params['limit'] ?? 12)));
        return ['page' => $page, 'limit' => $limit, 'offset' => ($page - 1) * $limit];
    }
}
