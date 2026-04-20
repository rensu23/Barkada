<?php
/**
 * Small response helper example.
 * Use this so PHP endpoints return a consistent JSON shape.
 */

function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
