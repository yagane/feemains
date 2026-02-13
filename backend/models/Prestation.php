<?php
require_once __DIR__ . '/../core/Database.php';

class Prestation {

    public static function findAll($date) {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM prestations ORDER BY duree ASC");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}
