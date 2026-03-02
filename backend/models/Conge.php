<?php
require_once __DIR__ . '/../core/Database.php';

class Conge {

    public static function all() {
        $db = Database::connect();
        $stmt = $db->query(
            "SELECT date_debut, date_fin FROM conges"
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function insert($dateDebut, $dateFin) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "INSERT INTO conges (date_debut, date_fin)
            VALUES (?, ?)"
        );
        $stmt->execute([$dateDebut, $dateFin]);
    }

    public static function delete($id) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "DELETE FROM conges WHERE id = ?"
        );
        $stmt->execute([$id]);
    }
}
