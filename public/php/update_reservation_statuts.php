<?php
// Connexion à la base de données
$db = new PDO('mysql:host=db5019347394.hosting-data.io;dbname=dbs15148152', 'dbu1416311', 'Y@gane11123213221');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Mettre à jour les réservations dont la date est passée
$stmt = $db->prepare("
    UPDATE reservations
    SET statut = 'passé'
    WHERE (statut = 'en attente')
    AND (date_reservation < NOW())
");

$stmt->execute();
?>
