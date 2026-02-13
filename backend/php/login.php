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
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$_POST['email']]);
    $user = $stmt->fetch();

  	$email = $_POST['email'];
    $password = $_POST['password'];

    if (!$user) {

        exit;
    }

    if (!password_verify($password, $user['password'])) {
        header('Location: https://fee-mains.com/login.html?error=password');
        exit;
    }

    $_SESSION['user'] = $user;
    header('Location: https://fee-mains.com/index.html');
    exit;
}
?>