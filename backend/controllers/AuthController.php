<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {

    public static function login() {
        session_start();

        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['email'], $data['password'])) {
            echo json_encode(["error" => "Données invalides"]);
            return;
        }

        $user = User::findByEmail($data['email']);

        if (!password_verify($password, $user['password'])) {
            header('Location: https://fee-mains.com/login.html?error=password');
            return;
        }

        $_SESSION['user'] = [
            'id' => $user['id'],
            'prenom' => $user['prenom'],
            'nom' => $user['nom'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'role' => $user['role']
        ];

        header('Location: https://fee-mains.com/reservation.html');
    }

    public static function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        $user = User::insert($data['prenom'],$data['nom'],$data['phone'],$data['email'],$data['password']);

        header('Location: https://fee-mains.com/login.html');
    }

    public static function me() {
        session_start();

        if (isset($_SESSION['user'])) {
            $user = $_SESSION['user'];

            echo json_encode([
                'connected' => true,
                'id' => $user['id'],
                'prenom' => $user['prenom'],
                'nom' => $user['nom'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'role' => $user['role']
            ]);
        }
    }

    public static function logout() {
        session_start();
        session_destroy();
        echo json_encode(["success" => true]);
    }
}
