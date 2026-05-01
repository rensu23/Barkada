<?php
/**
 * POST /auth/logout.php
 *
 * TODO:
 * - Destroy the PHP session.
 * - Return a simple success response.
 */
session_start();
session_unset();
session_destroy();

echo json_encode([
    "success" => true
]);
