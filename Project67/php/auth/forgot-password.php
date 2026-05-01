<?php
require_once '../config/database.php';
require_once '../helpers/response.php';

header('Content-Type: application/json');

// Get input
$data = json_decode(file_get_contents("php://input"), true);

// fallback if not JSON (form submit)
if (!$data) {
    $data = $_POST;
}

if (!isset($data['email'])) {
    echo json_encode(["error" => "Email is required"]);
    exit;
}

$email = trim($data['email']);

try {
    $db = $conn;

    // Check if user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        echo json_encode(["error" => "Email not found"]);
        exit;
    }

    // Generate secure token
    $token = bin2hex(random_bytes(32));
    $expires = date("Y-m-d H:i:s", strtotime("+1 hour"));

    // Save token
    $stmt = $db->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $token, $expires);
    $stmt->execute();

    // TEMP: Return reset link
    $resetLink = "http://localhost/reset-password.html?token=" . $token;

    echo json_encode([
        "message" => "Reset link generated",
        "reset_link" => $resetLink
    ]);

} catch (Exception $e) {
    echo json_encode(["error" => "Server error"]);
}