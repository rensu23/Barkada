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



