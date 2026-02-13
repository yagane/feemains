<?php
session_set_cookie_params([
    'httponly' => true,
    'secure' => true, // uniquement si HTTPS activé
    'samesite' => 'Strict'
]);

header("Content-Type: application/json");

require_once __DIR__ . '/../backend/controllers/AuthController.php';

$uri = $_SERVER['REQUEST_URI'];

if (strpos($uri, '/api/login') !== false) {
    AuthController::login();

} elseif (strpos($uri, '/api/me') !== false) {
    AuthController::me();

} elseif (strpos($uri, '/api/logout') !== false) {
    AuthController::logout();

} else {
    http_response_code(404);
    echo json_encode(["error" => "Route non trouvée"]);
}
