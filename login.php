<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$email = clean($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(false, 'Email and password required');
}

// Find user
$stmt = $conn->prepare("SELECT id, name, email, password, role, status FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    jsonResponse(false, 'Invalid email or password');
}

$user = $result->fetch_assoc();

// Check status
if ($user['status'] !== 'active') {
    jsonResponse(false, 'Account is ' . $user['status'] . '. Contact admin.');
}

// Verify password
if (!password_verify($password, $user['password'])) {
    jsonResponse(false, 'Invalid email or password');
}

// Set session
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_role'] = $user['role'];

jsonResponse(true, 'Login successful!', [
    'user_id' => $user['id'],
    'name' => $user['name'],
    'role' => $user['role']
]);
?>