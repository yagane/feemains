<?php
require_once __DIR__ . '/../models/Mail.php';

class MailController {
    public static function resaConfirmation() {

        //$data = json_decode(file_get_contents("php://input"), true);

       Mail::resaConfirmation();

        echo json_encode(['success' => true, 'message' => 'Mail envoyé avec succès.']);
    }
}