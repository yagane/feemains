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
            $mail->Host = 'smtp.ionos.fr';
            $mail->SMTPAuth = true;
            $mail->Username = 'messages-noreply@fee-mains.com';
            $mail->Password = 'Y@gane11123213221';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('messages-noreply@fee-mains.com', 'Fée mains');
            $mail->addAddress('yagane33@gmail.com', 'Yanis');

            $mail->isHTML(true);
            $mail->Subject = 'Sujet de l\'e-mail';
            $mail->Body = 'Ceci est un <b>e-mail</b> envoyé avec PHPMailer.';

            $mail->send();

            return "Envoyé avec succes";

        } catch (Exception $e) {
            return "Erreur : {$mail->ErrorInfo}";
        }
    }
}