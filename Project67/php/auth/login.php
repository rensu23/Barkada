<?php
/**
 * POST /auth/login.php
 *
 * Expected request fields:
 * - email
 * - password
 *
 * TODO:
 * - Query users by email.
 * - Verify password hash.
 * - Store session user_id after success.
 * - Return safe user details only.
 */
session_start();
header("Content-Type: application/json");
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"];
$password = $data["password"];
$remember = isset($data["remember"]) ? $data["remember"] : false;

$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user["password"])) {

        // SESSION
        $_SESSION["user_id"] = $user["id"];

        // REMEMBER ME (cookie)
        if ($remember) {
            $token = bin2hex(random_bytes(32));

            // store token in DB (you need a column: remember_token)
            $stmt2 = $conn->prepare("UPDATE users SET remember_token=? WHERE id=?");
            $stmt2->bind_param("si", $token, $user["id"]);
            $stmt2->execute();

            setcookie("remember_token", $token, time() + (86400 * 30), "/"); // 30 days
        }

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Wrong password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}

