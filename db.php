<?php
require_once 'config.php';

// Create MySQLi connection
$conn = new mysqli(
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_PORT
);
// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]));
}

// Set charset for Hindi/English support
$conn->set_charset("utf8mb4");

// Helper: Clean user input (prevent SQL injection)
function clean($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $conn->real_escape_string($data);
}

// Helper: Send JSON response
function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Helper: Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Helper: Get user role
function getUserRole() {
    return $_SESSION['user_role'] ?? 'guest';
}

// Helper: Require login
function requireLogin() {
    if (!isLoggedIn()) {
        jsonResponse(false, 'Please login first');
    }
}

// Helper: Require admin
function requireAdmin() {
    requireLogin();
    if (getUserRole() !== 'admin') {
        jsonResponse(false, 'Admin access required');
    }
}
?>