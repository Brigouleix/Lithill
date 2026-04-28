<?php
namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $uri, mixed $action): void    { $this->add('GET',    $uri, $action); }
    public function post(string $uri, mixed $action): void   { $this->add('POST',   $uri, $action); }
    public function put(string $uri, mixed $action): void    { $this->add('PUT',    $uri, $action); }
    public function patch(string $uri, mixed $action): void  { $this->add('PATCH',  $uri, $action); }
    public function delete(string $uri, mixed $action): void { $this->add('DELETE', $uri, $action); }

    private function add(string $method, string $uri, mixed $action): void
    {
        $this->routes[$method][$uri] = $action;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = trim(parse_url($uri, PHP_URL_PATH), '/');

        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        foreach ($this->routes[$method] ?? [] as $pattern => $action) {
            $regex = preg_replace('/\{[a-z_]+\}/', '([^/]+)', $pattern);
            if (preg_match("#^{$regex}$#", $path, $m)) {
                array_shift($m);
                $this->run($action, $m);
                return;
            }
        }

        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Route introuvable']);
    }

    private function run(mixed $action, array $params): void
    {
        if (is_callable($action)) {
            call_user_func_array($action, $params);
            return;
        }
        [$class, $method] = explode('@', $action);
        $fqcn = "\\App\\Controllers\\{$class}";
        (new $fqcn())->{$method}(...$params);
    }
}
