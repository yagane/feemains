<?php
if (!isset($_GET['date'])) {
    echo json_encode(['success' => false, 'message' => 'Date manquante']);
    exit;
}

$db = new PDO(
    "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']}",
    $env['DB_USER'],
    $env['DB_PASS'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
);

try {
    $stmt = $db->prepare("
        SELECT date_reservation, duree_reservation
        FROM reservations
        WHERE DATE(date_reservation) = ?
    ");
    $stmt->execute([$_GET['date']]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'reservations' => $reservations]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
}
?>