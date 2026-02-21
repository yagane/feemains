<?php
require_once __DIR__ . '/../models/Prestation.php';

class PrestaController {

    public static function getAllPresta() {

        $data = json_decode(file_get_contents("php://input"), true);

        $prestations = Prestation::findAll();

        echo json_encode($prestations);
    }

    public static function prestaByResaID() {

        $data = json_decode(file_get_contents("php://input"), true);

        $prestations = Prestation::findByResaID();

        echo json_encode($prestations);
    }



}
