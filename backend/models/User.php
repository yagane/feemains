<?php
require_once __DIR__ . '/../core/Database.php';

class User {

    public static function findByEmail($email) {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function findByID($user_id) {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$user_id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function findAllClient() {
        $db = Database::connect();
        $stmt = $db->query("SELECT * FROM users WHERE role = 'client'");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function insert($prenom, $nom, $phone, $email, $password) {
        $password = password_hash($password, PASSWORD_BCRYPT);

        $db = Database::connect();
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $emailExists = $stmt->fetchColumn();

        if ($emailExists) {
            return ["success" => false, "message" => 'email_exist'];
        }

        $stmt = $db->prepare("INSERT INTO users (prenom, nom, phone, email, password) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$prenom, $nom, $phone, $email, $password])) {
            return ["success" => true];
        } else {
            return ["success" => false, "message" => 'register'];
        }
    }

    public static function insertInvite($prenom, $nom, $phone, $email) {
        $db = Database::connect();

        $stmt = $db->prepare("INSERT INTO users (prenom, nom, phone, email) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$prenom, $nom, $phone, $email])) {
            return ["success" => true];
        } else {
            return ["success" => false];
        }
    }
}
