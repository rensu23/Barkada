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

$dbConfig = [
    'host' => getenv('BARKADA_DB_HOST') ?: '127.0.0.1',
    'port' => getenv('BARKADA_DB_PORT') ?: '3306',
    'database' => 'barkada_db',
    'username' => getenv('BARKADA_DB_USER') ?: '',
    'password' => getenv('BARKADA_DB_PASS') ?: '',
];

/*
$pdo = new PDO(
    "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset=utf8mb4",
    $dbConfig['username'],
    $dbConfig['password'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
);
*/
