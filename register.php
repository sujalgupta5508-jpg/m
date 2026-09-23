<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Get form data
$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$phone = clean($_POST['phone'] ?? '');
$role = clean($_POST['role'] ?? 'buyer');
$password = $_POST['password'] ?? '';

// Validation
if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    jsonResponse(false, 'All fields are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Invalid email format');
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters');
}

if (!in_array($role, ['farmer', 'buyer'])) {
    $role = 'buyer';
}

// Check if email already exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();

if ($check->get_result()->num_rows > 0) {
    jsonResponse(false, 'Email already registered');
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $conn->prepare("INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, 'active')");
$stmt->bind_param("sssss", $name, $email, $phone, $hashedPassword, $role);

if ($stmt->execute()) {
    $userId = $stmt->insert_id;
    jsonResponse(true, 'Registration successful! Please login.', ['user_id' => $userId]);
} else {
    jsonResponse(false, 'Registration failed: ' . $conn->error);
}
?>