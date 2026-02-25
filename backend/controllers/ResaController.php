<?php
require_once __DIR__ . '/../models/Reservation.php';

class ResaController {

    public static function resaAllByDate() {

        $data = json_decode(file_get_contents("php://input"), true);

        $reservations = Reservation::allByDateOrder($data['dateSplit']);

        echo json_encode($reservations);
    }

    public static function resaAllByMY() {

        $data = json_decode(file_get_contents("php://input"), true);

        $reservations = Reservation::allByMY($data['mois'], $data['annee']);

        echo json_encode($reservations);
    }

    public static function resaTimeDurationByDate() {

        $data = json_decode(file_get_contents("php://input"), true);

        $reservations = Reservation::timeDurationByDate($data['date']);

        echo json_encode(['success' => true, 'reservations' => $reservations]);
    }

    public static function resaByUser() {

        $data = json_decode(file_get_contents("php://input"), true);

        $reservations = Reservation::findByUserID($data['userID']);

        echo json_encode($reservations);
    }

    public static function resaByID() {

        $data = json_decode(file_get_contents("php://input"), true);

        $reservation = Reservation::findByID($data['id']);

        echo json_encode($reservation);
    }

    public static function insertResa() {

        $data = json_decode(file_get_contents("php://input"), true);

        $userID = isset($data['id']) ? (int)$data['id'] : null;
        $prestationIds = isset($data['prestId']) ? $data['prestId'] : [];
        $date = isset($data['date']) ? $data['date'] : null;
        $duree = isset($data['duree']) ? $data['duree'] : null;

        Reservation::insert($userID,$date,$duree,$prestationIds);

        echo json_encode(['success' => true, 'message' => 'Réservation enregistrée avec succès.']);
    }

    public static function deleteResa() {

        $data = json_decode(file_get_contents("php://input"), true);

        Reservation::delete($data['reservationId']);

        echo json_encode(['success' => true, 'message' => 'Réservation annulée avec succès.']);
    }

}
