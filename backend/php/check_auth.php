<?php
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