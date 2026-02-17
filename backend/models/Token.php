<?php
require_once __DIR__ . '/../core/Database.php';

class Token {

    public static function findByToken($tokenHash) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "SELECT user_id, expires_at
            FROM remember_tokens
            WHERE token_hash = ?
            LIMIT 1"
        );
        $stmt->execute([$tokenHash]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public static function insert($user_id, $tokenHash, $expires) {
        $db = Database::connect();
        $stmt = $db->prepare(
            "INSERT INTO remember_tokens (user_id, token_hash, expires_at)
            VALUES (?, ?, ?)"
        );
        $stmt->execute([
            $user_id,
            $tokenHash,
            date('Y-m-d H:i:s', $expires)
        ]);
    }


    public static function update($newHash, $newExpires, $tokenHash) {
        $db = Database::connect();
        $update = $db->prepare(
            "UPDATE remember_tokens
            SET token_hash = ?, expires_at = ?
            WHERE token_hash = ?"
        );
        $update->execute([
            $newHash,
            date('Y-m-d H:i:s', $newExpires),
            $tokenHash
        ]);
    }

    public static function delete($tokenHash) {
        $db = Database::connect();
        $stmt = $db->prepare("
            DELETE FROM remember_tokens WHERE token_hash = ?
        ");
        $stmt->execute([$tokenHash]);
    }
}