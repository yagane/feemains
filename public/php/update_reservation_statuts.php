<?php
// Connexion à la base de données
$db = new PDO(
    "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']}",
    $env['DB_USER'],
    $env['DB_PASS'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);

// Mettre à jour les réservations dont la date est passée
$stmt = $db->prepare("
    UPDATE reservations
    SET statut = 'passé'
    WHERE (statut = 'en attente')
    AND (date_reservation < NOW())
");

$stmt->execute();
?>
