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

    public static function updateEmail($id, $email) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "UPDATE users SET email=:email
            WHERE id=:id"
        );
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
    }

    public static function mergeUser($id_new, $id_old) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "UPDATE reservations
            SET user_id = :id_new
            WHERE user_id = :id_old;

            DELETE FROM users
            WHERE id = :id_old;"
        );
        $stmt->bindParam(':id_new', $id_new, PDO::PARAM_INT);
        $stmt->bindParam(':id_old', $id_old, PDO::PARAM_STR);
        $stmt->execute();
    }

    public static function updatePhone($id, $phone) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "UPDATE users SET phone=:phone
            WHERE id=:id"
        );
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':phone', $phone, PDO::PARAM_STR);
        $stmt->execute();
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
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $emailExists = $stmt->fetchColumn();

        if ($emailExists and $email != null) {
            return ["success" => false, "message" => 'email_exist'];
        }

        $stmt = $db->prepare("INSERT INTO users (prenom, nom, phone, email) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$prenom, $nom, $phone, $email])) {
            return ["success" => true];
        } else {
            return ["success" => false, "message" => 'register'];
        }
    }
}
