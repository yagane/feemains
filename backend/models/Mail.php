<?php
require_once __DIR__ . '/../core/Database.php';

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mail {

    public static function resaConfirmation() {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'feemains.mm@gmail.com';
            $mail->Password = 'ton_mot_de_passe';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('feemains.mm@gmail.com', 'Fée mains');
            $mail->addAddress('destinataire@example.com', 'Nom du destinataire');

            $mail->isHTML(true);
            $mail->Subject = 'Sujet de l\'e-mail';
            $mail->Body = 'Ceci est un <b>e-mail</b> envoyé avec PHPMailer.';

            $mail->send();
            echo 'E-mail envoyé avec succès !';
        } catch (Exception $e) {
            echo "Erreur : {$mail->ErrorInfo}";
        }
    }
}