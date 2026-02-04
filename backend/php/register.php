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
$db = new PDO('mysql:host=db5019347394.hosting-data.io;dbname=dbs15148152', 'dbu1416311', 'Y@gane11123213221');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $prenom = $_POST['prenom'];
    $nom = $_POST['nom'];
  	$phone = $_POST['phone'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $emailExists = $stmt->fetchColumn();

    if ($emailExists) {
        // Rediriger avec un message d'erreur spécifique
        header('Location: /register.html?error=email_exists');
        exit;
    }

    $stmt = $db->prepare("INSERT INTO users (prenom, nom, email, phone, password) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$prenom, $nom, $email, $phone, $password])) {
        header('Location: /login.html?success=1');
        exit;
    } else {
        header('Location: /register.html?error=register');
        exit;
    }
}
?>

