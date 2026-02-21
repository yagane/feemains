<?php
require_once __DIR__ . '/../core/Database.php';

class Prestation {

    public static function findAll() {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM prestations ORDER BY duree ASC");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findByResaID($id) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "SELECT
                r.*,
                GROUP_CONCAT(p.nom SEPARATOR ', ') AS prestation_noms,
                GROUP_CONCAT(p.duree SEPARATOR ', ') AS prestation_duree,
                GROUP_CONCAT(p.prix SEPARATOR ', ') AS prestation_prix
            FROM reservations as r
            INNER JOIN reservations_prestations as rp ON r.id = rp.reservation_id
            INNER JOIN prestations as p ON rp.prestation_id = p.id
            WHERE r.id = ?
            GROUP BY r.id;"

        );
        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


}
