<?php
/**
 * Shared mysqli database connection.
 * All PHP files include this file instead of opening their own connection.
 */

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = "localhost";
$user = "root";
$pass = "";
$db   = "barkada_db";

try {
    $conn = new mysqli($host, $user, $pass, $db);
    $conn->set_charset("utf8mb4");
    ensureBarkadaSchema($conn);
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed. Please check XAMPP MySQL and barkada_db."
    ]);
    exit;
}

/**
 * Keeps older imported databases compatible with the current project code.
 * This only adds columns that are already documented in barkada_db.sql.
 */
function ensureBarkadaSchema(mysqli $conn): void
{
    if (!columnExists($conn, "contributions", "due_date")) {
        $conn->query("ALTER TABLE contributions ADD COLUMN due_date date DEFAULT NULL AFTER frequency");
    }

    if (!columnExists($conn, "contributions", "notes")) {
        $conn->query("ALTER TABLE contributions ADD COLUMN notes text DEFAULT NULL AFTER due_date");
    }
}

function columnExists(mysqli $conn, string $table, string $column): bool
{
    $stmt = $conn->prepare(
        "SELECT COUNT(*) AS total
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?"
    );
    $stmt->bind_param("ss", $table, $column);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return (int) ($row["total"] ?? 0) > 0;
}
?>
