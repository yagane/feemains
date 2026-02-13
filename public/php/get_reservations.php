<?php
$db = new PDO(
    "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']}",
    $env['DB_USER'],
    $env['DB_PASS'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);

$stmt = $db->prepare("SELECT *
                      FROM reservations
                      WHERE DATE(date_reservation) = ?
                      ORDER BY date_reservation
                      "
                    );
$stmt->execute([$_GET['date']]);
$reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($reservations);
?>