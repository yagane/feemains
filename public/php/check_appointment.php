<?php
if (!isset($_GET['date'])) {
    echo json_encode(['success' => false, 'message' => 'Date manquante']);
    exit;
}

$db = new PDO('mysql:host=db5019347394.hosting-data.io;dbname=dbs15148152', 'dbu1416311', 'Y@gane11123213221');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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