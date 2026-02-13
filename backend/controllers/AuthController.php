<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {

    public static function login() {

        session_start();

        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['email'], $data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données invalides"]);
            return;
        }

        $user = User::findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(["error" => "Identifiants incorrects"]);
            return;
        }

        // ✅ On stocke en session
        $_SESSION['user'] = [
            "id" => $user['id'],
            "email" => $user['email']
        ];

        echo json_encode(["success" => true]);
    }

    public static function register() {

        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['email'], $data['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "Données invalides"]);
            return;
        }

        $user = User::findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(["error" => "Identifiants incorrects"]);
            return;
        }

        // ✅ On stocke en session
        $_SESSION['user'] = [
            "id" => $user['id'],
            "email" => $user['email']
        ];

        echo json_encode(["success" => true]);
    }

    public static function me() {

        session_start();

        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['connected' => false]);
        }else{
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
