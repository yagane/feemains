<?php
require_once __DIR__ . '/../models/Conge.php';

class CongeController {

    public static function congeAll() {
        $data = json_decode(file_get_contents("php://input"), true);

        $conges = Conge::all();

        echo json_encode($conges);
    }

    public static function insertConge() {
        $data = json_decode(file_get_contents("php://input"), true);

        Conge::insert($data['dateDebut'], $data['dateFin']);

        echo json_encode(['success' => true, 'message' => 'Congé enregistrée avec succès.']);
    }

    public static function deleteConge() {
        $data = json_decode(file_get_contents("php://input"), true);

        Conge::delete($data['id']);

        echo json_encode(['success' => true, 'message' => 'Congé annulée avec succès.']);
    }

}
