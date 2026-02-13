<?php

class Router {

    private $routes = [];

    public function add($method, $path, $action) {
        $this->routes[] = [
            "method" => $method,
            "path" => $path,
            "action" => $action
        ];
    }

    public function dispatch() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'];

        foreach ($this->routes as $route) {
            if ($route["method"] === $method && $route["path"] === $uri) {
                call_user_func($route["action"]);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(["error" => "Route non trouvée"]);
    }
}
