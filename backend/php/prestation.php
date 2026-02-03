<?php
header('Content-Type: application/json');
$db = new PDO('mysql:host=db5019347394.hosting-data.io;dbname=dbs15148152', 'dbu1416311', 'Y@gane11123213221');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $db->query("SELECT * FROM prestations ORDER BY duree ASC");
$prestations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($prestations);
?>
