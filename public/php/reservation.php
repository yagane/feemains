<?php
// Récupérer les données envoyées
$data = json_decode(file_get_contents('php://input'), true);

// Récupérer les données envoyées
$userId = isset($data['id']) ? (int)$data['id'] : null;
$prestationIds = isset($data['prestId']) ? $data['prestId'] : [];
$date = isset($data['date']) ? $data['date'] : null;
$duree = isset($data['duree']) ? $data['duree'] : null;

// Vérifier que toutes les données sont présentes
if (!$prestationIds || !$date || !$duree) {
  echo json_encode(['success' => false, 'message' => $date]);
  exit;
}

// Connexion à la base de données
$db = new PDO('mysql:host=db5019347394.hosting-data.io;dbname=dbs15148152', 'dbu1416311', 'Y@gane11123213221');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
  // Insérer la réservation
  $stmt = $db->prepare("
        INSERT INTO reservations (user_id, date_reservation, duree_reservation)
        VALUES (?, ?, ?)
    ");
  $stmt->execute([$userId, $date, $duree]);
  $reservationId = $db->lastInsertId();

  // Insérer les prestations associées
  $stmt = $db->prepare("
        INSERT INTO reservations_prestations (reservation_id, prestation_id)
        VALUES (?, ?)
    ");
  foreach ($prestationIds as $prestationId) {
    $stmt->execute([$reservationId, $prestationId]);
  }

  echo json_encode(['success' => true, 'message' => 'Réservation enregistrée avec succès.']);
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
}
?>