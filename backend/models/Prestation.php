<?php
require_once __DIR__ . '/../core/Database.php';

class Prestation {

    public static function findAll() {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM prestations ORDER BY duree ASC");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findByResaID() {
        $db = Database::connect();
        $stmt = $db->prepare(
            "SELECT p.*, r.*
            FROM reservations as r
            INNER JOIN reservations_prestations as rp ON r.id = rp.reservation_id
            INNER JOIN prestations as p ON rp.prestation_id = p.id
            WHERE r.id = ?"
        );
        $stmt->execute([$id]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


}
