<?php
require_once 'db.php';
requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request');
}

$senderId = $_SESSION['user_id'];
$receiverId = intval($_POST['receiver_id'] ?? 0);
$message = clean($_POST['message'] ?? '');

if (empty($message) || $receiverId <= 0) {
    jsonResponse(false, 'Message and receiver required');
}

$stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $senderId, $receiverId, $message);

if ($stmt->execute()) {
    jsonResponse(true, 'Message sent', ['message_id' => $stmt->insert_id]);
} else {
    jsonResponse(false, 'Failed to send message');
}
?>