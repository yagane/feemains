<?php
$allowed_origin = 'https://fee-mains.com';
if ($_SERVER['HTTP_ORIGIN'] !== $allowed_origin) {
    http_response_code(403);
    die(json_encode(['error' => 'Accès non autorisé']));
}

// En-têtes CORS
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
session_destroy();
header('Location: /index.html');
exit;
?>
