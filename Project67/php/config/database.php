<?php
/**
 * Database connection template for Barkada.
 *
 * TODO:
 * - Read credentials from environment variables or a private local file.
 * - Use PDO prepared statements for every query.
 * - Keep the database name aligned with barkada_db.sql.
 * - Catch PDOException and return a safe server error; do not expose secrets.
 */

$host = "localhost";
$user = "root";
$pass = "";
$db   = "barkada_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>
