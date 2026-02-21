<?php
require_once __DIR__ . '/../core/Database.php';

class Reservation {

    public static function allByDateOrder($date) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "SELECT r.id, r.date_reservation, r.duree_reservation, r.user_id, u.nom, u.prenom, u.email, u.phone
            FROM reservations as r
            INNER JOIN users as u ON u.id = r.user_id
            WHERE DATE(date_reservation) = ?
            ORDER BY date_reservation"
        );
        $stmt->execute([$date]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function timeDurationByDate($date) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "SELECT date_reservation, duree_reservation
            FROM reservations
            WHERE DATE(date_reservation) = ?"
        );
        $stmt->execute([$date]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findByUserID($userID) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "SELECT *
            FROM reservations
            WHERE user_id = ?
            ORDER BY date_reservation DESC"
        );
        $stmt->execute([$userID]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findByID($id) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "SELECT *
            FROM reservations
            WHERE id = ?"
        );
        $stmt->execute([$id]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function insert($userID, $date, $duree, $prestationIds) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "INSERT INTO reservations (user_id, date_reservation, duree_reservation)
            VALUES (?, ?, ?)"
        );
        $stmt->execute([$userID, $date, $duree]);
        $reservationId = $db->lastInsertId();

        $stmt = $db->prepare(
            "INSERT INTO reservations_prestations (reservation_id, prestation_id)
            VALUES (?, ?)"
        );

        foreach ($prestationIds as $prestationId) {
            $stmt->execute([$reservationId, $prestationId]);
        }
    }

    public static function delete($reservationId) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "DELETE FROM reservations WHERE id = ?"
        );
        $stmt->execute([$reservationId]);
    }
}
