<?php
require_once __DIR__ . '/../core/Database.php';

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mail {

    public static function resaConfirmation($destinataire, $nom, $date, $heure) {
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
            $mail->addAddress($destinataire);

            $mail->isHTML(true);
            $mail->Subject = 'Confirmation de rendez-vous';
            $mail->Body = "
                <html>
                    <head>
                        <meta charset='UTF-8'>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
                            .content { padding: 20px; }
                            .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; margin-top: 20px; }
                            .footer a { color: #17a2b8; text-decoration: none; }
                            .footer a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <div class='header'>
                            <h2>Fée Mains</h2>
                        </div>
                        <div class='content'>
                            <h2>Confirmation de votre rendez-vous</h2>
                            <p>Bonjour ". htmlspecialchars($nom, ENT_QUOTES, 'UTF-8') .",</p>
                            <p>Nous confirmons votre rendez-vous prévu le ". htmlspecialchars($date, ENT_QUOTES, 'UTF-8') ." à ". htmlspecialchars($heure, ENT_QUOTES, 'UTF-8') .".</p>
                            <p>En cas d'empechement Vous pouvez annulez votre rendez-vous via notre site/p>
                            <p>Cordialement,<br>Fée Mains</p>
                        </div>
                        <div class='footer'>
                            <p>Visitez notre site : <a href='https://fee-mains.com'>fee-mains.com</a></p>
                            <p>Contactez-nous : <a href='mailto:feemains.mm@gmail.com'>feemains.mm@gmail.com</a></p>
                            <p>Suivez-nous sur Instagram : <a href='https://instagram.com/feemains__/'>@feemains__</a></p>
                        </div>
                    </body>
                </html>
            ";

            $mail->send();

            $mail->setFrom('messages-noreply@fee-mains.com', 'Fée mains');
            $mail->addAddress('feemains.mm@gmail.com');

            $mail->isHTML(true);
            $mail->Subject = 'Confirmation de rendez-vous';
            $mail->Body = "
                <html>
                    <head>
                        <meta charset='UTF-8'>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
                            .content { padding: 20px; }
                            .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; margin-top: 20px; }
                            .footer a { color: #17a2b8; text-decoration: none; }
                            .footer a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <div class='header'>
                            <h2>Fée Mains</h2>
                        </div>
                        <div class='content'>
                            <h2>Confirmation de rendez-vous</h2>
                            <p>Confirmation du rendez-vous de ". htmlspecialchars($nom, ENT_QUOTES, 'UTF-8') ." prévu le ". htmlspecialchars($date, ENT_QUOTES, 'UTF-8') ." à ". htmlspecialchars($heure, ENT_QUOTES, 'UTF-8') .".</p>
                        </div>
                        <div class='footer'>
                            <p>Visitez notre site : <a href='https://fee-mains.com'>fee-mains.com</a></p>
                            <p>Contactez-nous : <a href='mailto:feemains.mm@gmail.com'>feemains.mm@gmail.com</a></p>
                            <p>Suivez-nous sur Instagram : <a href='https://instagram.com/feemains__/'>@feemains__</a></p>
                        </div>
                    </body>
                </html>
            ";

            $mail->send();

            return "Envoyé avec succes";

        } catch (Exception $e) {
            return "Erreur : {$mail->ErrorInfo}";
        }
    }
}