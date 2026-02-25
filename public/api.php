<?php
session_set_cookie_params([
    'httponly' => true,
    'secure' => true, // uniquement si HTTPS activé
    'samesite' => 'Strict'
]);

header("Content-Type: application/json");

require_once __DIR__ . '/../backend/core/Router.php';
require_once __DIR__ . '/../backend/controllers/AuthController.php';
require_once __DIR__ . '/../backend/controllers/PrestaController.php';
require_once __DIR__ . '/../backend/controllers/ResaController.php';

$router = new Router();

// Auth
$router->add("POST", "/api/login", ["AuthController", "login"]);
$router->add("POST", "/api/register", ["AuthController", "register"]);
$router->add("GET", "/api/logout", ["AuthController", "logout"]);
$router->add("GET", "/api/me", ["AuthController", "me"]);

$router->add("POST", "/api/resaAllByDate", ["ResaController", "resaAllByDate"]);
$router->add("POST", "/api/resaAllByMY", ["ResaController", "resaAllByMY"]);
$router->add("POST", "/api/resaTimeDurationByDate", ["ResaController", "resaTimeDurationByDate"]);
$router->add("POST", "/api/resaByUser", ["ResaController", "resaByUser"]);
$router->add("POST", "/api/resaByID", ["ResaController", "resaByID"]);
$router->add("POST", "/api/insertResa", ["ResaController", "insertResa"]);
$router->add("POST", "/api/deleteResa", ["ResaController", "deleteResa"]);

$router->add("GET", "/api/getAllPresta", ["PrestaController", "getAllPresta"]);

$router->dispatch();
