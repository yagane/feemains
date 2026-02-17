<?php
require_once __DIR__ . '/../models/User.php';

class AuthController {

    public static function login() {

        session_start();

        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['email'], $data['password'])) {
            echo json_encode(["success" => false]);
            return;
        }

        $user = User::findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            echo json_encode(["success" => false]);
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

        setcookie(
            'remember_me',
            $user,
            time() + (30 * 24 * 3600),
            '/',
            '',
            true,
            true
        );

        echo json_encode(["success" => true]);
    }

    public static function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        $user = User::insert($data['prenom'],$data['nom'],$data['phone'],$data['email'],$data['password']);

        echo json_encode(["success" => true]);
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
        }else{
            if (isset($_COOKIE['remember_me'])) {
                $user = $_COOKIE['remember_me'];

                $_SESSION['user'] = [
                    'id' => $user['id'],
                    'prenom' => $user['prenom'],
                    'nom' => $user['nom'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'role' => $user['role']
                ];

                setcookie(
                    'remember_me',
                    $user,
                    time() + (30 * 24 * 3600),
                    '/',
                    '',
                    true,
                    true
                );

                echo json_encode([
                    'connected' => true,
                    'id' => $user['id'],
                    'prenom' => $user['prenom'],
                    'nom' => $user['nom'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'role' => $user['role']
                ]);

                return;
            }

            echo json_encode(['connected' => false]);
        }
    }

    public static function logout() {
        session_start();
        session_unset();
        session_destroy();

        setcookie(
            'remember_me',
            '',
            time() - 3600, // Expiration dans le passé
            '/',
            '',
            true,
            true
        );

        header('Location: https://fee-mains.com');
    }
}
