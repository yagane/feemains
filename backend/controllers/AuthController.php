<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Token.php';

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

        $user_id = $user['id'];

        $_SESSION['user_id'] = $user_id;

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $expires = time() + (60 * 60 * 24 * 30);

        Token::insert($user_id, $tokenHash, $expires);

        setcookie(
            "remember_token",
            $token,
            [
                'expires' => $expires,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]
        );

        echo json_encode(["success" => true]);
    }

    public static function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        User::insert($data['prenom'],$data['nom'],$data['phone'],$data['email'],$data['password']);

        echo json_encode(["success" => true]);
    }

    public static function me() {
        session_start();

        if (isset($_SESSION['user_id'])) {
            $user_id = $_SESSION['user_id'];

            $user = User::findByID($user_id);

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
            if (isset($_COOKIE['remember_token'])) {
                $token = $_COOKIE['remember_token'];
                $tokenHash = hash('sha256', $token);

                $row = Token::findByToken($tokenHash);

                if ($row && strtotime($row['expires_at']) > time()) {
                    $_SESSION['user_id'] = $row['user_id'];

                    $newToken = bin2hex(random_bytes(32));
                    $newHash = hash('sha256', $newToken);
                    $newExpires = time() + (60 * 60 * 24 * 30);

                    Token::update($newHash, $newExpires, $tokenHash);

                    setcookie(
                        "remember_token",
                        $newToken,
                        [
                            'expires' => $newExpires,
                            'path' => '/',
                            'secure' => true,
                            'httponly' => true,
                            'samesite' => 'Strict'
                        ]
                    );

                    $user = User::findByID($user_id);

                    echo json_encode([
                        'connected' => true,
                        'id' => $user['id'],
                        'prenom' => $user['prenom'],
                        'nom' => $user['nom'],
                        'email' => $user['email'],
                        'phone' => $user['phone'],
                        'role' => $user['role']
                    ]);

                } else {
                    setcookie("remember_token", "", time() - 3600, "/");

                    echo json_encode(['connected' => false]);
                }
            } else {
                echo json_encode(['connected' => false]);
            }
        }
    }

    public static function logout() {
        session_start();

        if (isset($_COOKIE['remember_token'])) {

            $tokenHash = hash('sha256', $_COOKIE['remember_token']);

            Token::delete($tokenHash);

            setcookie("remember_token", "", time() - 3600, "/");
        }

        session_destroy();

        header('Location: https://fee-mains.com');
    }
}