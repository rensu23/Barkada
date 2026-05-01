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

header("Content-Type: application/json");

require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"];
$password = $data["password"];

$stmt = $conn->prepare("SELECT id, password, FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 1){
    $user = $result->fetch_assoc();

    if(password_verify($password, $user["password"])){
        echo json_encode([
            "success" => true,
            "user_id" => $user["id"]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Wrong password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}


