<?php
/**
 * GET /auth/session.php
 *
 * TODO:
 * - Return the logged-in user's safe session details.
 * - Useful for restoring frontend state after refresh.
 */

require_once __DIR__ . '/../helpers/validators.php';

session_start();
header('Content-Type: application/json');

// Secure Configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_secure' => true,
        'samesite' => 'Lax'
    ]);
}

/**
 * Return the logged-in user's safe session details.
 */
function getActiveSession() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized: No active session.'
        ]);
        exit;
    }

    // Filter sensitive data before returning to frontend
    echo json_encode([
        'success' => true,
        'user' => [
            'id'    => (int)$_SESSION['user_id'],
            'name'  => htmlspecialchars($_SESSION['user_name'] ?? ''),
            'email' => filter_var($_SESSION['user_email'] ?? '', FILTER_SANITIZE_EMAIL)
        ]
    ]);
}

getActiveSession();