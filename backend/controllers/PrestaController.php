<?php
require_once __DIR__ . '/../models/Prestation.php';

class PrestaController {

    public static function getAllPresta() {

        $data = json_decode(file_get_contents("php://input"), true);

        $prestations = Presation::findAll($data['date']);

        echo json_encode($prestations);
    }

}
