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

// delete cookie
setcookie("remember_user", "", time() - 3600, "/");

echo json_encode(["success" => true]);
