<?php
session_start();

$db = new PDO(
    "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']}",
    $env['DB_USER'],
    $env['DB_PASS'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);

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
    header('Location: https://fee-mains.com/reservation.html');
    exit;
}
?>