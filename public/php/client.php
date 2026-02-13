<?php
$db = new PDO(
    "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']}",
    $env['DB_USER'],
    $env['DB_PASS'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);

$stmt = $db->query("
        SELECT *
        FROM reservations
        ORDER BY date_reservation DESC
    ");
$reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($reservations);
?>