<?php
require_once __DIR__ . '/../core/Database.php';

class Prestation {

    public static function findAll() {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM prestations ORDER BY id DESC");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
