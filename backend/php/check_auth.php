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

if (isset($_SESSION['user'])) {
  $user = $_SESSION['user'];

  echo json_encode([
    'connected' => true,
    'id' => $user['id'],
    'prenom' => $user['prenom'],
    'nom' => $user['nom'],
    'email' => $user['email'],
    'phone' => $user['phone'],
    'role' => $user['role']
  ]);
} else {
  echo json_encode(['connected' => false]);
}
?>